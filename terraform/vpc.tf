module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "5.0.0"

  name = "soct-vpc"
  cidr = "10.0.0.0/16"

  azs             = ["eu-west-2a", "eu-west-2b"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24"]

  # One NAT Gateway for private subnets to access the internet (needed for EKS nodes to pull images).
  enable_nat_gateway = true
  single_nat_gateway = true # Keeps costs down for a personal/portfolio project
  enable_dns_hostnames = true
  enable_dns_support   = true

  # These tags are absolutely critical for EKS and the AWS Load Balancer Controller
  # to know which subnets to place public ALBs and private internal LBs into.
  public_subnet_tags = {
    "kubernetes.io/role/elb" = "1"
    "kubernetes.io/cluster/soct-eks-cluster" = "shared"
  }

  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" = "1"
    "kubernetes.io/cluster/soct-eks-cluster" = "shared"
  }

  tags = {
    Project     = "SOCT"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}
