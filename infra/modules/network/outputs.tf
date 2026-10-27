output "vpc_id" {
  description = "VPC id"
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "Public subnet ids, one per zone"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "Private subnet ids, one per zone"
  value       = aws_subnet.private[*].id
}

output "load_balancer_security_group_id" {
  description = "Security group of the load balancer"
  value       = aws_security_group.load_balancer.id
}

output "app_security_group_id" {
  description = "Security group of the application tasks"
  value       = aws_security_group.app.id
}

output "database_security_group_id" {
  description = "Security group of the database"
  value       = aws_security_group.database.id
}
