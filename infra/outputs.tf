output "lightsail_static_ip" {
  description = "Lightsail static IP address"
  value       = aws_lightsail_static_ip.main.ip_address
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "site_url" {
  description = "Full site URL"
  value       = "https://${var.domain_name}"
}
