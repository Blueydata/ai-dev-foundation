output "secret_arns" {
  description = "ARN of every secret, by environment variable name"

  value = merge(
    { for name, secret in aws_secretsmanager_secret.provided : name => secret.arn },
    { for name, secret in aws_secretsmanager_secret.generated : name => secret.arn },
  )
}

output "provided_secret_names" {
  description = "Full names of the secrets the product owner must fill in"
  value       = { for name, secret in aws_secretsmanager_secret.provided : name => secret.name }
}
