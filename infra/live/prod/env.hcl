locals {
  environment = "prod"
  aws_region  = "us-east-1"

  network = {
    cidr_block         = "10.20.0.0/16"
    az_count           = 2
    enable_nat_gateway = true
    single_nat_gateway = false
  }

  database = {
    min_capacity                 = 0.5
    max_capacity                 = 8
    instance_count               = 2
    deletion_protection          = true
    backup_retention_days        = 7
    performance_insights_enabled = true
  }

  app = {
    cpu                 = 1024
    memory              = 2048
    cpu_architecture    = "ARM64"
    desired_count       = 2
    min_count           = 2
    max_count           = 10
    tasks_in_public     = false
    certificate_arn     = null
    log_retention_days  = 30
    container_insights  = true
    deletion_protection = true
  }

  app_environment = {}

  provided_secrets  = []
  generated_secrets = []
}
