module "assets" {
  source = "../../../modules/s3"

  bucket_name        = "superlavish-assets-staging"
  environment        = "staging"
  versioning_enabled = true
}
