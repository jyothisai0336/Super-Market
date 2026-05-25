# Read VPC outputs from the VPC stack's remote state
data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "superlavish-tf-state"
    key    = "staging/vpc/terraform.tfstate"
    region = "ap-south-1"
  }
}

# IAM roles for EKS (cluster + nodes) live with the EKS stack
module "iam" {
  source = "../../../modules/iam"

  app_name    = "superlavish"
  environment = "staging"
}

module "eks" {
  source = "../../../modules/eks"

  cluster_name     = "superlavish-staging-cluster"
  cluster_version  = "1.30"
  environment      = "staging"
  cluster_role_arn = module.iam.eks_cluster_role_arn
  node_role_arn    = module.iam.eks_node_role_arn
  subnet_ids       = data.terraform_remote_state.vpc.outputs.private_subnet_ids

  instance_types = ["t3.medium"]
  min_size       = 1
  max_size       = 3
  desired_size   = 2
}
