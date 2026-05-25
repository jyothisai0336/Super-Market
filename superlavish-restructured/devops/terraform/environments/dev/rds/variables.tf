variable "db_password" {
  description = "Master DB password — pass via TF_VAR_db_password or -var"
  type        = string
  sensitive   = true
}
