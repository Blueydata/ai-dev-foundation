locals {
  project     = "ai-dev-foundation"
  env         = read_terragrunt_config(find_in_parent_folders("env.hcl")).locals
  environment = local.env.environment
  aws_region  = local.env.aws_region

  tags = {
    Project     = local.project
    Environment = local.environment
    ManagedBy   = "terraform"
  }
}

remote_state {
  backend = "s3"

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }

  config = {
    bucket       = "${local.project}-tfstate-${local.environment}-${get_aws_account_id()}"
    key          = "${path_relative_to_include()}/terraform.tfstate"
    region       = local.aws_region
    encrypt      = true
    use_lockfile = true
  }
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<PROVIDER
provider "aws" {
  region = "${local.aws_region}"

  default_tags {
    tags = ${jsonencode(local.tags)}
  }
}
PROVIDER
}

inputs = {
  project     = local.project
  environment = local.environment
}
