output "bucket" {
  description = "S3 bucket name for Terraform state"
  value       = aws_s3_bucket.tfstate.id
}

output "dynamodb_table" {
  description = "DynamoDB table name for state locking"
  value       = aws_dynamodb_table.tflock.name
}

output "region" {
  description = "AWS region"
  value       = var.aws_region
}
