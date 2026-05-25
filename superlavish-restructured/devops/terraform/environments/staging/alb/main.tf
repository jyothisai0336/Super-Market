data "terraform_remote_state" "vpc" {
  backend = "s3"
  config = {
    bucket = "superlavish-tf-state"
    key    = "staging/vpc/terraform.tfstate"
    region = "ap-south-1"
  }
}

module "alb" {
  source = "../../../modules/alb"

  app_name                   = "superlavish"
  environment                = "staging"
  vpc_id                     = data.terraform_remote_state.vpc.outputs.vpc_id
  public_subnet_ids          = data.terraform_remote_state.vpc.outputs.public_subnet_ids
  enable_deletion_protection = false
  health_check_path          = "/actuator/health"
}
