data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "superlavish-tf-state"
    key    = "dev/vpc/terraform.tfstate"
    region = "ap-south-1"
  }
}

data "terraform_remote_state" "eks" {
  backend = "s3"
  config = {
    bucket = "superlavish-tf-state"
    key    = "dev/eks/terraform.tfstate"
    region = "ap-south-1"
  }
}

module "rds" {
  source = "../../../modules/rds"

  app_name    = "superlavish"
  environment = "dev"
  vpc_id      = data.terraform_remote_state.vpc.outputs.vpc_id
  subnet_ids  = data.terraform_remote_state.vpc.outputs.private_subnet_ids

  # Allow connections from EKS pods (via EKS-managed SG)
  allowed_security_group_ids = [data.terraform_remote_state.eks.outputs.cluster_security_group_id]
  # Plus allow from VPC CIDR as a fallback
  allowed_cidr_blocks = [data.terraform_remote_state.vpc.outputs.vpc_cidr_block]

  instance_class      = "db.t3.micro"
  db_password         = var.db_password
  multi_az            = false
  deletion_protection = false
  skip_final_snapshot = true
}
