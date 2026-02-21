# Origin A record — CloudFront uses this domain instead of raw IP
resource "aws_route53_record" "origin" {
  zone_id = var.route53_zone_id
  name    = "origin-housing.${replace(var.domain_name, "/^[^.]+\\./", "")}"
  type    = "A"
  ttl     = 300
  records = [aws_lightsail_static_ip.main.ip_address]
}

# Main A record — alias to CloudFront
resource "aws_route53_record" "main" {
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.main.domain_name
    zone_id                = aws_cloudfront_distribution.main.hosted_zone_id
    evaluate_target_health = false
  }
}
