variable "project" {
  description = "Project name used in resource names"
  type        = string
}

variable "environment" {
  description = "Environment name: dev or prod"
  type        = string
}

variable "subnet_ids" {
  description = "Private subnets where the database runs"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group that only accepts the application tasks"
  type        = string
}

variable "engine_version" {
  description = "Aurora PostgreSQL engine version"
  type        = string
  default     = "16.8"
}

variable "database_name" {
  description = "Name of the application database"
  type        = string
  default     = "app"
}

variable "master_username" {
  description = "Master user; its password is generated and stored by RDS in Secrets Manager"
  type        = string
  default     = "app"
}

variable "min_capacity" {
  description = "Minimum Aurora capacity units; 0 lets the database pause when idle"
  type        = number
  default     = 0.5
}

variable "max_capacity" {
  description = "Maximum Aurora capacity units"
  type        = number
  default     = 4
}

variable "seconds_until_auto_pause" {
  description = "Idle seconds before pausing, used only when min_capacity is 0"
  type        = number
  default     = 600
}

variable "instance_count" {
  description = "Number of instances: 1 writer plus readers for high availability"
  type        = number
  default     = 1
}

variable "deletion_protection" {
  description = "Protect the cluster against deletion and keep a final snapshot"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Days of automated backups"
  type        = number
  default     = 7
}

variable "performance_insights_enabled" {
  description = "Enable Performance Insights on the instances"
  type        = bool
  default     = true
}
