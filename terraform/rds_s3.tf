# S3 Bucket for Application Assets (Images)
resource "aws_s3_bucket" "app_assets" {
  bucket        = "soct-app-assets-bucket-harry"
  force_destroy = true
}

resource "aws_s3_bucket_public_access_block" "app_assets_public" {
  bucket = aws_s3_bucket.app_assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "allow_public_read" {
  bucket     = aws_s3_bucket.app_assets.id
  depends_on = [aws_s3_bucket_public_access_block.app_assets_public]
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.app_assets.arn}/*"
      },
    ]
  })
}

# RDS Subnet Group
resource "aws_db_subnet_group" "rds_subnet_group" {
  name       = "soct-rds-subnet-group"
  subnet_ids = module.vpc.private_subnets
}

# RDS Security Group
resource "aws_security_group" "rds_sg" {
  name        = "soct-rds-sg"
  description = "Allow inbound PostgreSQL traffic from EKS"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = [module.vpc.vpc_cidr_block]
  }
}

# Generate a random, secure password for the RDS database
resource "random_password" "db_password" {
  length  = 16
  special = true
}

# RDS PostgreSQL Instance
resource "aws_db_instance" "soct_db" {
  identifier           = "soct-postgres-db"
  allocated_storage    = 20
  storage_type         = "gp2"
  engine               = "postgres"
  engine_version       = "16"
  instance_class       = "db.t3.micro"
  db_name              = "soctdb"
  username             = "soctadmin"
  password             = random_password.db_password.result
  parameter_group_name = "default.postgres16"
  skip_final_snapshot  = true

  db_subnet_group_name   = aws_db_subnet_group.rds_subnet_group.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]
}
