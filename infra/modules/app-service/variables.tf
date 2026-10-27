variable "project" {
  description = "Project name used in resource names"
  type        = string
}

variable "environment" {
  description = "Environment name: dev or prod"
  type        = string
}

variable "vpc_id" {
  description = "VPC id"
  type        = string
}

variable "public_subnet_ids" {
  description = "Subnets of the load balancer"
  type        = list(string)
}

variable "task_subnet_ids" {
  description = "Subnets of the application tasks: public in dev, private in prod"
  type        = list(string)
}

variable "assign_public_ip" {
  description = "Give tasks a public IP, needed when they run in public subnets without NAT"
  type        = bool
  default     = false
}

variable "load_balancer_security_group_id" {
  description = "Security group of the load balancer"
  type        = string
}

variable "app_security_group_id" {
  description = "Security group of the application tasks"
  type        = string
}

variable "image_repository_url" {
  description = "Image repository URL, without the tag"
  type        = string
}

variable "image_tag" {
  description = "Image tag to run"
  type        = string
}

variable "container_port" {
  description = "Port the application listens on"
  type        = number
  default     = 3000
}

variable "cpu" {
  description = "Task CPU units (1024 = 1 vCPU)"
  type        = number
  default     = 512
}

variable "memory" {
  description = "Task memory in MiB"
  type        = number
  default     = 1024
}

variable "cpu_architecture" {
  description = "ARM64 (Graviton, cheaper) or X86_64"
  type        = string
  default     = "ARM64"

  validation {
    condition     = contains(["ARM64", "X86_64"], var.cpu_architecture)
    error_message = "Use ARM64 or X86_64."
  }
}

variable "desired_count" {
  description = "Initial number of tasks"
  type        = number
  default     = 1
}

variable "min_count" {
  description = "Minimum number of tasks for autoscaling"
  type        = number
  default     = 1
}

variable "max_count" {
  description = "Maximum number of tasks for autoscaling"
  type        = number
  default     = 4
}

variable "target_cpu_utilization" {
  description = "Average CPU percentage the autoscaling keeps"
  type        = number
  default     = 60
}

variable "environment_variables" {
  description = "Plain configuration for the application, by name"
  type        = map(string)
  default     = {}
}

variable "secret_arns" {
  description = "Secrets Manager ARNs injected as environment variables, by name"
  type        = map(string)
  default     = {}
}

variable "database_host" {
  description = "Database writer endpoint"
  type        = string
}

variable "database_port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "database_name" {
  description = "Database name"
  type        = string
}

variable "database_secret_arn" {
  description = "RDS-managed secret with the database username and password"
  type        = string
}

variable "certificate_arn" {
  description = "ACM certificate for HTTPS; without it the load balancer serves HTTP only"
  type        = string
  default     = null
}

variable "log_retention_days" {
  description = "Days the application logs are kept"
  type        = number
  default     = 30
}

variable "container_insights" {
  description = "Enable CloudWatch Container Insights on the cluster"
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Protect the load balancer against deletion"
  type        = bool
  default     = true
}
