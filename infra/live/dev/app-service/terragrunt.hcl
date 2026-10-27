include "root" {
  path = find_in_parent_folders("root.hcl")
}

locals {
  env = read_terragrunt_config(find_in_parent_folders("env.hcl")).locals
  app = local.env.app
}

terraform {
  source = "${dirname(find_in_parent_folders("root.hcl"))}/../modules//app-service"
}

dependency "network" {
  config_path = "../network"

  mock_outputs = {
    vpc_id                          = "vpc-00000000000000001"
    public_subnet_ids               = ["subnet-00000000000000001", "subnet-00000000000000002"]
    private_subnet_ids              = ["subnet-00000000000000003", "subnet-00000000000000004"]
    load_balancer_security_group_id = "sg-00000000000000001"
    app_security_group_id           = "sg-00000000000000002"
  }
  mock_outputs_allowed_terraform_commands = ["init", "validate", "plan"]
}

dependency "container_registry" {
  config_path = "../container-registry"

  mock_outputs = {
    repository_url = "000000000000.dkr.ecr.us-east-1.amazonaws.com/mock"
  }
  mock_outputs_allowed_terraform_commands = ["init", "validate", "plan"]
}

dependency "database" {
  config_path = "../database"

  mock_outputs = {
    endpoint               = "mock.cluster.us-east-1.rds.amazonaws.com"
    port                   = 5432
    database_name          = "app"
    master_user_secret_arn = "arn:aws:secretsmanager:us-east-1:000000000000:secret:mock-database"
  }
  mock_outputs_allowed_terraform_commands = ["init", "validate", "plan"]
}

dependency "secrets" {
  config_path = "../secrets"

  mock_outputs = {
    secret_arns = {}
  }
  mock_outputs_allowed_terraform_commands = ["init", "validate", "plan"]
}

inputs = {
  vpc_id                          = dependency.network.outputs.vpc_id
  public_subnet_ids               = dependency.network.outputs.public_subnet_ids
  task_subnet_ids                 = local.app.tasks_in_public ? dependency.network.outputs.public_subnet_ids : dependency.network.outputs.private_subnet_ids
  assign_public_ip                = local.app.tasks_in_public
  load_balancer_security_group_id = dependency.network.outputs.load_balancer_security_group_id
  app_security_group_id           = dependency.network.outputs.app_security_group_id
  image_repository_url            = dependency.container_registry.outputs.repository_url
  image_tag                       = get_env("IMAGE_TAG", "latest")
  cpu                             = local.app.cpu
  memory                          = local.app.memory
  cpu_architecture                = local.app.cpu_architecture
  desired_count                   = local.app.desired_count
  min_count                       = local.app.min_count
  max_count                       = local.app.max_count
  certificate_arn                 = local.app.certificate_arn
  log_retention_days              = local.app.log_retention_days
  container_insights              = local.app.container_insights
  deletion_protection             = local.app.deletion_protection
  environment_variables           = local.env.app_environment
  secret_arns                     = dependency.secrets.outputs.secret_arns
  database_host                   = dependency.database.outputs.endpoint
  database_port                   = dependency.database.outputs.port
  database_name                   = dependency.database.outputs.database_name
  database_secret_arn             = dependency.database.outputs.master_user_secret_arn
}
