module "assets" {
  source = "../../../modules/s3"

  bucket_name        = "superlavish-assets-dev"
  environment        = "dev"
  versioning_enabled = true
}
