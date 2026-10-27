variable "project" {
  description = "Project name used in resource names"
  type        = string
}

variable "environment" {
  description = "Environment name: dev or prod"
  type        = string
}

variable "cidr_block" {
  description = "CIDR block of the VPC"
  type        = string
}

variable "az_count" {
  description = "Number of availability zones to use"
  type        = number
  default     = 2
}

variable "enable_nat_gateway" {
  description = "Create NAT gateways so private subnets reach the internet"
  type        = bool
  default     = false
}

variable "single_nat_gateway" {
  description = "Use one NAT gateway for all zones instead of one per zone"
  type        = bool
  default     = true
}

variable "app_port" {
  description = "Port the application container listens on"
  type        = number
  default     = 3000
}

variable "database_port" {
  description = "Port of the database"
  type        = number
  default     = 5432
}
