output "db_instance_id" {
  description = "RDS instance ID"
  value       = aws_db_instance.main.id
}

output "db_endpoint" {
  description = "RDS connection endpoint (host:port)"
  value       = aws_db_instance.main.endpoint
  sensitive   = true
}

output "db_address" {
  description = "RDS DNS hostname"
  value       = aws_db_instance.main.address
  sensitive   = true
}

output "db_port" {
  description = "RDS port"
  value       = aws_db_instance.main.port
}

output "db_security_group_id" {
  description = "Security group ID for the RDS instance"
  value       = aws_security_group.db.id
}
