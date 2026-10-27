output "url" {
  description = "Public URL of the application"
  value       = "${var.certificate_arn == null ? "http" : "https"}://${aws_lb.main.dns_name}"
}

output "cluster_name" {
  description = "ECS cluster name"
  value       = aws_ecs_cluster.main.name
}

output "service_name" {
  description = "ECS service name"
  value       = aws_ecs_service.app.name
}

output "log_group_name" {
  description = "CloudWatch log group of the application"
  value       = aws_cloudwatch_log_group.app.name
}
