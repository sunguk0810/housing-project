# ── Managed cache policies ──
data "aws_cloudfront_cache_policy" "caching_optimized" {
  name = "Managed-CachingOptimized"
}

data "aws_cloudfront_cache_policy" "caching_disabled" {
  name = "Managed-CachingDisabled"
}

# ── Managed origin request policies ──
data "aws_cloudfront_origin_request_policy" "all_viewer_except_host" {
  name = "Managed-AllViewerExceptHostHeader"
}

# ── Custom cache policy for ISR pages (/complex/*) ──
resource "aws_cloudfront_cache_policy" "isr_3600" {
  name        = "housing-isr-3600"
  min_ttl     = 0
  default_ttl = 3600
  max_ttl     = 3600

  parameters_in_cache_key_and_forwarded_to_origin {
    cookies_config {
      cookie_behavior = "none"
    }
    headers_config {
      header_behavior = "none"
    }
    query_strings_config {
      query_string_behavior = "all"
    }
  }
}

# ── CloudFront distribution ──
resource "aws_cloudfront_distribution" "main" {
  enabled         = true
  is_ipv6_enabled = true
  aliases         = [var.domain_name]
  comment         = "Housing project - portfolio"

  origin {
    domain_name = aws_route53_record.origin.fqdn
    origin_id   = "lightsail"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }

    custom_header {
      name  = "X-CF-Secret"
      value = var.cf_secret_token
    }
  }

  # Behavior 1: /_next/static/* — Build assets (hashed, long cache)
  ordered_cache_behavior {
    path_pattern           = "/_next/static/*"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "lightsail"
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = data.aws_cloudfront_cache_policy.caching_optimized.id
    compress               = true
  }

  # Behavior 2: /api/* — API routes (no cache, all methods)
  ordered_cache_behavior {
    path_pattern             = "/api/*"
    allowed_methods          = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods           = ["GET", "HEAD"]
    target_origin_id         = "lightsail"
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
    compress                 = true
  }

  # Behavior 3: /complex/* — ISR pages (TTL 3600s)
  ordered_cache_behavior {
    path_pattern             = "/complex/*"
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    target_origin_id         = "lightsail"
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = aws_cloudfront_cache_policy.isr_3600.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
    compress                 = true
  }

  # Behavior 4 (Default): * — SSR/RSC dynamic (no cache)
  default_cache_behavior {
    allowed_methods          = ["GET", "HEAD"]
    cached_methods           = ["GET", "HEAD"]
    target_origin_id         = "lightsail"
    viewer_protocol_policy   = "redirect-to-https"
    cache_policy_id          = data.aws_cloudfront_cache_policy.caching_disabled.id
    origin_request_policy_id = data.aws_cloudfront_origin_request_policy.all_viewer_except_host.id
    compress                 = true
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.main.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
