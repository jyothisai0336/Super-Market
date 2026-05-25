# ──────────────────────────────────────────────────────────────────────────────
# EKS Module: Cluster + managed node group.
# Requires IAM roles to be created externally (passed in as variables).
# ──────────────────────────────────────────────────────────────────────────────

resource "aws_eks_cluster" "main" {
  name     = var.cluster_name
  role_arn = var.cluster_role_arn
  version  = var.cluster_version

  vpc_config {
    subnet_ids              = var.subnet_ids
    endpoint_public_access  = var.endpoint_public_access
    endpoint_private_access = true
  }

  tags = merge(var.tags, {
    Name        = var.cluster_name
    Environment = var.environment
  })
}

resource "aws_eks_node_group" "workers" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.cluster_name}-workers"
  node_role_arn   = var.node_role_arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    min_size     = var.min_size
    max_size     = var.max_size
    desired_size = var.desired_size
  }

  instance_types = var.instance_types
  capacity_type  = var.capacity_type

  update_config {
    max_unavailable = 1
  }

  tags = merge(var.tags, {
    Environment = var.environment
  })
}
