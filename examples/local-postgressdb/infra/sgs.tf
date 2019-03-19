

# create RDS security group
resource "aws_security_group" "rds_potgress_allow" {
    count       = "${var.create_sg}"
    name        = "rds-public-std"
    description = "Grant Access to Pgsql"
    vpc_id      = "${data.aws_vpc.default.id}"

    # inbound
    ingress {
        from_port       = 5432
        to_port         = 5432
        protocol        = "tcp"
        cidr_blocks     = [ "${data.aws_vpc.default.cidr_block}", "0.0.0.0/0"]
    }

    # outbound
    egress {
        from_port       = 0
        to_port         = 0
        protocol        = "-1"
        cidr_blocks     = ["0.0.0.0/0"]
    }

}
