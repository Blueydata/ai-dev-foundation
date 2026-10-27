include "root" {
  path = find_in_parent_folders("root.hcl")
}

locals {
  env = read_terragrunt_config(find_in_parent_folders("env.hcl")).locals
}

terraform {
  source = "${dirname(find_in_parent_folders("root.hcl"))}/../modules//secrets"
}

inputs = {
  provided_secret_names   = local.env.provided_secrets
  generated_secret_names  = local.env.generated_secrets
  recovery_window_in_days = local.env.environment == "dev" ? 0 : 7
}
