resource "aws_security_group" "load_balancer" {
  name        = "${local.name}-load-balancer"
  description = "Public HTTP and HTTPS entry to the application"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${local.name}-load-balancer"
  }
}

resource "aws_vpc_security_group_ingress_rule" "load_balancer_http" {
  security_group_id = aws_security_group.load_balancer.id
  description       = "HTTP from the internet"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 80
  to_port           = 80
}

resource "aws_vpc_security_group_ingress_rule" "load_balancer_https" {
  security_group_id = aws_security_group.load_balancer.id
  description       = "HTTPS from the internet"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "load_balancer_to_app" {
  security_group_id            = aws_security_group.load_balancer.id
  description                  = "Requests to the application tasks"
  referenced_security_group_id = aws_security_group.app.id
  ip_protocol                  = "tcp"
  from_port                    = var.app_port
  to_port                      = var.app_port
}

resource "aws_security_group" "app" {
  name        = "${local.name}-app"
  description = "Application tasks, reachable only from the load balancer"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${local.name}-app"
  }
}

resource "aws_vpc_security_group_ingress_rule" "app_from_load_balancer" {
  security_group_id            = aws_security_group.app.id
  description                  = "Requests from the load balancer"
  referenced_security_group_id = aws_security_group.load_balancer.id
  ip_protocol                  = "tcp"
  from_port                    = var.app_port
  to_port                      = var.app_port
}

resource "aws_vpc_security_group_egress_rule" "app_to_internet" {
  security_group_id = aws_security_group.app.id
  description       = "HTTPS to AWS APIs, the image registry and external APIs"
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "tcp"
  from_port         = 443
  to_port           = 443
}

resource "aws_vpc_security_group_egress_rule" "app_to_database" {
  security_group_id            = aws_security_group.app.id
  description                  = "Connections to the database"
  referenced_security_group_id = aws_security_group.database.id
  ip_protocol                  = "tcp"
  from_port                    = var.database_port
  to_port                      = var.database_port
}

resource "aws_security_group" "database" {
  name        = "${local.name}-database"
  description = "Database, reachable only from the application tasks"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${local.name}-database"
  }
}

resource "aws_vpc_security_group_ingress_rule" "database_from_app" {
  security_group_id            = aws_security_group.database.id
  description                  = "Connections from the application tasks"
  referenced_security_group_id = aws_security_group.app.id
  ip_protocol                  = "tcp"
  from_port                    = var.database_port
  to_port                      = var.database_port
}
