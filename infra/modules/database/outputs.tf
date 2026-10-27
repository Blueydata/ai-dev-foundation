output "endpoint" {
  description = "Writer endpoint of the cluster"
  value       = aws_rds_cluster.main.endpoint
}

output "reader_endpoint" {
  description = "Reader endpoint of the cluster"
  value       = aws_rds_cluster.main.reader_endpoint
}

output "port" {
  description = "Database port"
  value       = aws_rds_cluster.main.port
}

output "database_name" {
  description = "Name of the application database"
  value       = aws_rds_cluster.main.database_name
}

output "master_user_secret_arn" {
  description = "Secret, managed by RDS, with the master username and password"
  value       = aws_rds_cluster.main.master_user_secret[0].secret_arn
}
