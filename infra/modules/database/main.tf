locals {
  name = "${var.project}-${var.environment}"
}

resource "aws_db_subnet_group" "main" {
  name       = local.name
  subnet_ids = var.subnet_ids
}

resource "aws_rds_cluster" "main" {
  cluster_identifier                  = local.name
  engine                              = "aurora-postgresql"
  engine_mode                         = "provisioned"
  engine_version                      = var.engine_version
  database_name                       = var.database_name
  master_username                     = var.master_username
  manage_master_user_password         = true
  db_subnet_group_name                = aws_db_subnet_group.main.name
  vpc_security_group_ids              = [var.security_group_id]
  storage_encrypted                   = true
  iam_database_authentication_enabled = true
  deletion_protection                 = var.deletion_protection
  backup_retention_period             = var.backup_retention_days
  preferred_backup_window             = "03:00-04:00"
  copy_tags_to_snapshot               = true
  skip_final_snapshot                 = !var.deletion_protection
  final_snapshot_identifier           = var.deletion_protection ? "${local.name}-final" : null
  enabled_cloudwatch_logs_exports     = ["postgresql"]

  serverlessv2_scaling_configuration {
    min_capacity             = var.min_capacity
    max_capacity             = var.max_capacity
    seconds_until_auto_pause = var.min_capacity == 0 ? var.seconds_until_auto_pause : null
  }
}

resource "aws_rds_cluster_instance" "main" {
  count = var.instance_count

  identifier                   = "${local.name}-${count.index + 1}"
  cluster_identifier           = aws_rds_cluster.main.id
  instance_class               = "db.serverless"
  engine                       = aws_rds_cluster.main.engine
  engine_version               = aws_rds_cluster.main.engine_version
  db_subnet_group_name         = aws_db_subnet_group.main.name
  publicly_accessible          = false
  auto_minor_version_upgrade   = true
  performance_insights_enabled = var.performance_insights_enabled
}
