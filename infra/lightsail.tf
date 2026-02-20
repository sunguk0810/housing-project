resource "aws_lightsail_instance" "main" {
  name              = "housing-prod"
  availability_zone = "${var.aws_region}a"
  blueprint_id      = "ubuntu_22_04"
  bundle_id         = var.lightsail_bundle_id
  key_pair_name     = var.ssh_key_name
  user_data         = file("${path.module}/scripts/user-data.sh")

  tags = {
    Project     = "housing"
    Environment = "production"
  }
}

resource "aws_lightsail_static_ip" "main" {
  name = "housing-prod-ip"
}

resource "aws_lightsail_static_ip_attachment" "main" {
  static_ip_name = aws_lightsail_static_ip.main.name
  instance_name  = aws_lightsail_instance.main.name
}

resource "aws_lightsail_instance_public_ports" "main" {
  instance_name = aws_lightsail_instance.main.name

  port_info {
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
  }

  port_info {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
  }
}
