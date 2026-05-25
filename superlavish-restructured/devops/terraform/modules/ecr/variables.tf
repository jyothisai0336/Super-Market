variable "namespace" {
  description = "ECR namespace prefix (e.g., superlavish)"
  type        = string
}

variable "repository_names" {
  description = "List of repository names to create (e.g., auth-service, product-service)"
  type        = list(string)
}

variable "image_tag_mutability" {
  description = "MUTABLE or IMMUTABLE"
  type        = string
  default     = "MUTABLE"
}

variable "max_image_count" {
  description = "Max number of images to retain per repository"
  type        = number
  default     = 30
}

variable "tags" {
  description = "Tags applied to all resources"
  type        = map(string)
  default     = {}
}
