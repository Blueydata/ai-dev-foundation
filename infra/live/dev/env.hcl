locals {
  environment = "dev"
  aws_region  = "us-east-1"

  network = {
    cidr_block         = "10.10.0.0/16"
    az_count           = 2
    enable_nat_gateway = false
    single_nat_gateway = true
  }

  database = {
    min_capacity                 = 0
    max_capacity                 = 2
    instance_count               = 1
    deletion_protection          = false
    backup_retention_days        = 1
    performance_insights_enabled = false
  }

  app = {
    cpu                 = 512
    memory              = 1024
    cpu_architecture    = "ARM64"
    desired_count       = 1
    min_count           = 1
    max_count           = 3
    tasks_in_public     = true
    certificate_arn     = null
    log_retention_days  = 7
    container_insights  = false
    deletion_protection = false
  }

  app_environment = {}

  provided_secrets  = []
  generated_secrets = []
}
