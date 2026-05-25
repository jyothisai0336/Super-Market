# Read VPC outputs from the VPC stack's remote state
data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "superlavish-tf-state"
    key    = "prod/vpc/terraform.tfstate"
    region = "ap-south-1"
  }
}

# IAM roles for EKS (cluster + nodes) live with the EKS stack
module "iam" {
  source = "../../../modules/iam"

  app_name    = "superlavish"
  environment = "prod"
}

module "eks" {
  source = "../../../modules/eks"

  cluster_name     = "superlavish-prod-cluster"
  cluster_version  = "1.30"
  environment      = "prod"
  cluster_role_arn = module.iam.eks_cluster_role_arn
  node_role_arn    = module.iam.eks_node_role_arn
  subnet_ids       = data.terraform_remote_state.vpc.outputs.private_subnet_ids

  instance_types = ["t3.large"]
  min_size       = 2
  max_size       = 6
  desired_size   = 3
}
