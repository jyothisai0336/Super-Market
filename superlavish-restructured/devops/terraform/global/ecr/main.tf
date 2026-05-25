# ──────────────────────────────────────────────────────────────────────────────
# ECR repositories are shared across environments — one repo per service,
# different image tags distinguish dev/staging/prod images.
# ──────────────────────────────────────────────────────────────────────────────

module "ecr" {
  source = "../../modules/ecr"

  namespace       = "superlavish"
  max_image_count = 50
  repository_names = [
    "auth-service",
    "product-service",
    "cart-service",
    "order-service",
    "gateway",
    "frontend",
  ]
}
