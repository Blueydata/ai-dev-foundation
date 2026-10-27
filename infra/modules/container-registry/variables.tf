variable "project" {
  description = "Project name used in resource names"
  type        = string
}

variable "environment" {
  description = "Environment name: dev or prod"
  type        = string
}

variable "images_to_keep" {
  description = "Number of most recent images kept in the repository"
  type        = number
  default     = 20
}

variable "force_delete" {
  description = "Delete the repository even when it still has images"
  type        = bool
  default     = false
}
