output "repository_url" {
  description = "URL used to tag and push the application image"
  value       = aws_ecr_repository.app.repository_url
}

output "repository_arn" {
  description = "ARN of the repository"
  value       = aws_ecr_repository.app.arn
}
