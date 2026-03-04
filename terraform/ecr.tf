resource "aws_ecr_repository" "frontend" {
  name                 = "soct-frontend"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "eventapp" {
  name                 = "soct-eventapp"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "imageservice" {
  name                 = "soct-imageservice"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}

resource "aws_ecr_repository" "webservices" {
  name                 = "soct-webservices"
  image_tag_mutability = "MUTABLE"
  force_delete         = true
}
