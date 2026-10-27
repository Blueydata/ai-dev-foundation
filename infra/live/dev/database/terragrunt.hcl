include "root" {
  path = find_in_parent_folders("root.hcl")
}

locals {
  env = read_terragrunt_config(find_in_parent_folders("env.hcl")).locals
}

terraform {
  source = "${dirname(find_in_parent_folders("root.hcl"))}/../modules//database"
}

dependency "network" {
  config_path = "../network"

  mock_outputs = {
    private_subnet_ids         = ["subnet-00000000000000001", "subnet-00000000000000002"]
    database_security_group_id = "sg-00000000000000001"
  }
  mock_outputs_allowed_terraform_commands = ["init", "validate", "plan"]
}

inputs = merge(local.env.database, {
  subnet_ids        = dependency.network.outputs.private_subnet_ids
  security_group_id = dependency.network.outputs.database_security_group_id
})
