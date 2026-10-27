---
name: infrastructure-as-code
description: How the AWS infrastructure is written and kept in sync with every feature - Terraform modules and Terragrunt units in infra/, dev and prod environments, configuration and secrets per environment, security, cost and scalability rules, the validation command and the deploy runbook. Use whenever a feature adds configuration, secrets or cloud resources, when changing anything in infra/, and when asked to plan or deploy to AWS.
---

# Infrastructure as code

The AWS infrastructure lives in `infra/` and grows **with every feature**. A feature is not done until `dev` and `prod` have what it needs and `docker compose run --rm infra check` passes. Everything runs in Docker: nobody installs Terraform, Terragrunt or the AWS CLI.

## Structure

```
infra/
  modules/                       Terraform modules: what a piece of infrastructure is, with no environment values
    network/                     VPC, public and private subnets, NAT gateways, security groups (load balancer, app, database)
    container-registry/          ECR repository with scan on push and a lifecycle policy
    secrets/                     Secrets Manager secrets: provided by the product owner (empty) or generated (random)
    database/                    Aurora PostgreSQL Serverless v2 cluster and instances
    app-service/                 ECS cluster, Fargate task and service, load balancer, IAM, logs and autoscaling
  live/                          Terragrunt: where and with which values each module runs
    root.hcl                     Remote state (S3 with lockfile), generated AWS provider, tags, common inputs
    dev/
      env.hcl                    Every value of the environment: region, sizes, flags, app configuration and secret names
      network/terragrunt.hcl     One unit per module, reading env.hcl and the outputs of its dependencies
      container-registry/
      secrets/
      database/
      app-service/
    prod/                        Same units, different env.hcl
  tools/                         Image with Terraform, Terragrunt, TFLint, Checkov and the AWS CLI, and the infra command
  .tflint.hcl                    Lint rules (Terraform recommended preset and AWS ruleset)
  .checkov.yml                   Security scan settings and the checks skipped on purpose
```

- **Modules** never contain environment values, provider blocks or backends. They take variables (typed, described, with safe defaults) and return outputs.
- **Units** (`live/<env>/<unit>/terragrunt.hcl`) are the same in `dev` and `prod`. Differences between environments live **only** in `live/<env>/env.hcl`.
- **Dependencies** between units use `dependency` blocks with `mock_outputs` for `init`, `validate` and `plan`, so a plan works before anything exists.
- Names: `<project>-<environment>` for resources, kebab-case folders, snake_case variables and outputs. Every resource gets the `Project`, `Environment` and `ManagedBy` tags from `root.hcl`.

## Environments

| Setting | dev | prod |
| --- | --- | --- |
| Network | 2 zones, no NAT gateway; tasks in public subnets with a public IP, reachable only from the load balancer | 2 zones, one NAT gateway per zone; tasks in private subnets |
| Database | Aurora Serverless v2, 0 to 2 ACU (pauses after 10 idle minutes when nothing connects), 1 instance, no deletion protection, 1 day of backups | 0.5 to 8 ACU, 2 instances (writer and reader in different zones), deletion protection, 7 days of backups, Performance Insights |
| Application | 0.5 vCPU and 1 GB on ARM (Graviton), 1 to 3 tasks | 1 vCPU and 2 GB on ARM, 2 to 10 tasks |
| Load balancer | HTTP, no deletion protection | HTTPS when `certificate_arn` is set, deletion protection |
| Logs | 7 days, no Container Insights | 30 days, Container Insights |

## What a feature changes

| The feature adds… | Change |
| --- | --- |
| A local configuration value (model name, feature flag) | `app_environment` in `live/dev/env.hcl` and `live/prod/env.hcl`, with the production value; never a secret |
| A key or credential only the product owner has (external API key, admin e-mail and password) | Its name in `provided_secrets` in both `env.hcl`; the secret is created empty and filled with `aws secretsmanager put-secret-value` (see the runbook). The app receives it as an environment variable with the same name |
| A secret the system can generate (session key, signing key) | Its name in `generated_secrets` in both `env.hcl` |
| Tables, columns, indexes | Nothing in `infra/`: migrations run when the container starts (`scripts/start.mjs`) |
| More traffic or heavier work | `app` sizes and task limits, or `database` capacity, in `env.hcl` |
| A new kind of resource (bucket, queue, scheduled job, email) | A new module in `infra/modules/`, a unit in `live/dev` and `live/prod`, outputs wired into `app-service` as environment variables, and IAM permissions on the task role limited to that resource |

The application reads every value through `src/shared/config/env.ts`, exactly as in Docker Compose; only the source changes.

## Rules

1. **No secret values in code, `env.hcl` or plain environment variables.** Secrets go to Secrets Manager and reach the task through the `secrets` of the container definition. Generated secrets live in the state, which is encrypted in S3.
2. **Least privilege.** The execution role reads only the secrets of the service; the task role has only the permissions a feature needs, on its own resources.
3. **Nothing reachable from the internet except the load balancer.** Tasks accept traffic only from the load balancer security group, the database only from the tasks.
4. **Encryption everywhere it is free:** database storage, ECR (KMS), state bucket, secrets.
5. **Stateless application.** Sessions in signed cookies, files in a bucket, never on the task disk or in memory: tasks are replaced and multiplied at any time.
6. **Scale with limits.** Autoscaling keeps average CPU at the target between `min_count` and `max_count`. Keep `max_count × pool size` below what the database accepts at its maximum capacity.
7. **Cost-aware dev.** No NAT gateway, ARM tasks, a database that can pause, short log retention. Explain the cost of every new resource in the plan.
8. **`prod` protects data:** deletion protection, backups, final snapshot, multiple zones.
9. **No comments in HCL, Terraform, Dockerfiles or scripts** (`code-standards`); explanations go to `docs/technical/infrastructure.md`.
10. **Never run `apply` or `destroy`** unless the product owner asks for that environment explicitly. `check` and `plan` are always safe.

## Validation

Run before saying a change is done:

```bash
docker compose run --rm infra check
```

It runs, with no AWS account: `terraform fmt -check` on the modules, `terragrunt hcl fmt --check` on `live/`, `terraform validate` and `tflint` on every module, and the Checkov security scan. CI runs the same command (job "Infrastructure") and builds the production `Dockerfile` (job "Production image").

With AWS credentials, `docker compose run --rm infra plan dev` shows every change; read it and summarize additions, changes and destructions before anyone applies.

When a Checkov check does not apply, add it to `skip-check` in `infra/.checkov.yml` only with the reason written in `docs/technical/infrastructure.md`.

## Deploy runbook

Full steps, with commands for each system, in `docs/technical/infrastructure.md` ("Deploy"). In short:

1. Credentials: `docker compose run --rm infra aws configure sso` once, then `export AWS_PROFILE=<profile>` (PowerShell: `$env:AWS_PROFILE="<profile>"`).
2. Registry first: `docker compose run --rm infra apply dev container-registry`.
3. Image: log in to ECR, then `docker buildx build --platform linux/arm64 -t <repository>:<tag> --push .`
4. Everything else: `IMAGE_TAG=<tag> docker compose run --rm infra apply dev`.
5. Secrets: fill every provided secret, then force a new deployment of the service.
6. Open the `url` output of `app-service`.
7. When finished: `docker compose run --rm infra destroy dev`.
