output "db_endpoint" {
  value     = module.rds.db_endpoint
  sensitive = true
}

output "db_address" {
  value     = module.rds.db_address
  sensitive = true
}

output "db_port" {
  value = module.rds.db_port
}
