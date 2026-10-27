set -eu

ROOT=/workspace/infra
COMMAND="${1:-help}"
ENVIRONMENT="${2:-}"
UNIT="${3:-}"

mkdir -p "$TF_PLUGIN_CACHE_DIR" "$TG_DOWNLOAD_DIR"

usage() {
  echo "Usage: docker compose run --rm infra <command>"
  echo ""
  echo "  check                          Format, validate, lint and scan the infrastructure code (no AWS account)"
  echo "  plan <dev|prod> [unit]         Show what would change in AWS"
  echo "  apply <dev|prod> [unit]        Create or update the infrastructure"
  echo "  destroy <dev|prod> [unit]      Delete the infrastructure"
  echo "  output <dev|prod> <unit>       Show the outputs of one unit"
  echo "  image-repo <dev|prod>          Print the image repository URL"
  echo "  ecr-password                   Print a Docker login password for the image registry"
  echo "  aws <arguments>                Run the AWS CLI (for example: aws configure sso)"
}

require_environment() {
  case "$ENVIRONMENT" in
    dev | prod) ;;
    *)
      usage
      exit 1
      ;;
  esac
}

check() {
  WORK="$(mktemp -d)"
  cp -R "$ROOT/modules" "$WORK/modules"

  echo "== terraform fmt"
  terraform fmt -check -recursive -diff "$ROOT/modules"

  echo "== terragrunt hcl fmt"
  (cd "$ROOT/live" && terragrunt hcl fmt --check --diff)

  for MODULE in $(find "$WORK/modules" -mindepth 1 -maxdepth 1 -type d | sort); do
    NAME="$(basename "$MODULE")"
    echo "== terraform validate: $NAME"
    terraform -chdir="$MODULE" init -backend=false -input=false -no-color > /dev/null
    terraform -chdir="$MODULE" validate -no-color
    echo "== tflint: $NAME"
    tflint --chdir="$MODULE" --config="$ROOT/.tflint.hcl" --no-color
  done

  echo "== checkov"
  checkov --directory "$WORK/modules" --config-file "$ROOT/.checkov.yml"

  rm -rf "$WORK"
  echo "Infrastructure check passed."
}

run_terragrunt() {
  require_environment
  if [ -n "$UNIT" ]; then
    cd "$ROOT/live/$ENVIRONMENT/$UNIT"
    terragrunt "$COMMAND" --backend-bootstrap
  else
    cd "$ROOT/live/$ENVIRONMENT"
    terragrunt run --all --backend-bootstrap -- "$COMMAND"
  fi
}

case "$COMMAND" in
  check)
    check
    ;;
  plan | apply | destroy)
    run_terragrunt
    ;;
  output)
    require_environment
    cd "$ROOT/live/$ENVIRONMENT/$UNIT"
    terragrunt output
    ;;
  image-repo)
    require_environment
    cd "$ROOT/live/$ENVIRONMENT/container-registry"
    terragrunt output -raw repository_url
    ;;
  ecr-password)
    aws ecr get-login-password
    ;;
  aws)
    shift
    aws "$@"
    ;;
  *)
    usage
    ;;
esac
