module "vpc" {
  source = "../../../modules/vpc"

  app_name             = "superlavish"
  environment          = "prod"
  cluster_name         = "superlavish-prod-cluster"
  vpc_cidr             = "10.30.0.0/16"
  azs                  = ["ap-south-1a", "ap-south-1b"]
  public_subnet_cidrs  = ["10.30.1.0/24", "10.30.2.0/24"]
  private_subnet_cidrs = ["10.30.11.0/24", "10.30.12.0/24"]
}
