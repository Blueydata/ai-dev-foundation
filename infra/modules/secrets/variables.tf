variable "project" {
  description = "Project name used in resource names"
  type        = string
}

variable "environment" {
  description = "Environment name: dev or prod"
  type        = string
}

variable "provided_secret_names" {
  description = "Secrets whose values only the product owner can provide, created empty and filled outside Terraform"
  type        = list(string)
  default     = []
}

variable "generated_secret_names" {
  description = "Secrets generated randomly by Terraform, such as session keys"
  type        = list(string)
  default     = []
}

variable "recovery_window_in_days" {
  description = "Days a deleted secret can still be restored; 0 deletes immediately"
  type        = number
  default     = 7
}
