# 0003 — AWS infrastructure as code with Terraform and Terragrunt

**Date:** 2026-10-27 · **Status:** accepted

## Context

The product must be deployable to a scalable cloud environment, with separate `dev` and `prod`, and the infrastructure must evolve with every feature, written and validated by the same process as the code. Nobody should need to install cloud tools on their computer.

## Decision

- AWS, with ECS Fargate behind an Application Load Balancer for the application, Aurora PostgreSQL Serverless v2 for the database, ECR for images, Secrets Manager for secrets and CloudWatch Logs.
- Terraform modules in `infra/modules/` describe each piece with no environment values; Terragrunt units in `infra/live/<env>/` apply them with the values of `env.hcl`, so `dev` and `prod` share the same code.
- Remote state in S3 with native locking, created on the first run.
- All tools (Terraform, Terragrunt, TFLint, Checkov, AWS CLI) run in the `infra` Docker Compose service, through `docker compose run --rm infra <command>`.
- `infra check` (format, validate, lint, security scan) runs locally with no AWS account and in CI, together with the production image build.
- The `infrastructure-engineer` subagent updates `infra/` for both environments with every feature.

## Alternatives considered

- **App Runner or Elastic Beanstalk:** fewer resources, but less control over networking and scaling, and less transferable knowledge.
- **EKS (Kubernetes):** more flexible, but a cluster to operate and a higher fixed cost for a small product.
- **Plain Terraform workspaces without Terragrunt:** fewer tools, but environment values and backends end up repeated or hidden in variables files.
- **RDS for PostgreSQL provisioned instances:** cheaper at constant load, but no automatic capacity changes and no pause in `dev`.
- **Lambda with a serverless adapter:** scales to zero, but Next.js server features, long AI streams and database connections need extra pieces.

## Consequences

- A feature that needs configuration, a secret or a resource changes `infra/` in the same delivery, and CI proves it is valid.
- `dev` stays cheap and disposable; `prod` keeps data safe and runs in two zones.
- Deploying needs only Docker and AWS credentials.
- The ARM default lowers cost but makes image builds slower on Intel and Windows computers; the architecture is a setting in `env.hcl`.
