module "assets" {
  source = "../../../modules/s3"

  bucket_name        = "superlavish-assets-prod"
  environment        = "prod"
  versioning_enabled = true
}
