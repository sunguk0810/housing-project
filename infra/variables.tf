variable "aws_region" {
  description = "AWS region for Lightsail instance"
  type        = string
  default     = "ap-northeast-2"
}

variable "domain_name" {
  description = "Domain name for the application (e.g., housing.example.com)"
  type        = string
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
}

variable "ssh_key_name" {
  description = "Lightsail SSH key pair name"
  type        = string
}

variable "cf_secret_token" {
  description = "Secret token for CloudFront origin verification"
  type        = string
  sensitive   = true
}

variable "lightsail_bundle_id" {
  description = "Lightsail instance bundle ID"
  type        = string
  default     = "small_3_0"
}
