terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    bucket         = "superlavish-tf-state"
    key            = "prod/alb/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "superlavish-tf-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "ap-south-1"

  default_tags {
    tags = {
      Project     = "superlavish"
      Environment = "prod"
      ManagedBy   = "Terraform"
    }
  }
}
