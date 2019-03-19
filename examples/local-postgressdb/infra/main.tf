variable "profile" {
  description = "The AWS profile to use - defult's to default"
  default = "default"
}
variable "region" {
   default = "us-west-2" 
}
variable "rds_instance_class" {
    default= "db.t2.micro"  
}
variable "rds_engine" {
    default= "postgres"
}
variable "rds_engine_version" {
    default = "10.6"
}
variable "create_sg" {
  default = false
  description = "if set to false security groups allowing 0.0.0.0/0 will be created - good for quick testing ..."
}
variable "deletion_protection" {
  default = true
}


# Use default vpc
data "aws_vpc" "default" {
  default = true
}
# Get subnet id's
data "aws_subnet_ids" "all" {
  vpc_id = "${data.aws_vpc.default.id}"
}

# Get security group id's
data "aws_security_group" "default" {
  vpc_id = "${data.aws_vpc.default.id}"
  name   = "default"
}
module "db" {
  source = "terraform-aws-modules/rds/aws"
  version = "1.25.0"
  identifier = "esexample"

  engine         = "${var.rds_engine}"
  engine_version = "${var.rds_engine_version}"
  instance_class = "${var.rds_instance_class}"

  storage_type      = "gp2"
  allocated_storage = 10
  storage_encrypted = false

  # gets a public accessible dns name
  publicly_accessible = true

  # kms_key_id        = "arm:aws:kms:<region>:<account id>:key/<kms key id>"
  # according to doc if name is empty no database is created !
  name = "esexample"

  # NOTE: Do NOT use 'user' as the value for 'username' as it throws:
  # "Error creating DB Instance: InvalidParameterValue: MasterUsername
  # user cannot be used as it is a reserved word used by the engine"
  username = "example"

  password = "serverless"
  port     = "5432"

  vpc_security_group_ids = [ "${data.aws_security_group.default.id}" ]

  maintenance_window = "mon:01:00-mon:01:30"
  backup_window      = "00:00-00:30"

  # disable backups to create DB faster
  backup_retention_period = 14

  # HA ?
  multi_az = false

  # DB subnet group - considering it's public ...
  subnet_ids = ["${data.aws_subnet_ids.all.ids}"]

  # DB parameter group
  family = "postgres10"

  # DB option group
  major_engine_version = "10.6"

  # Snapshot name upon DB deletion
  final_snapshot_identifier = "esexample-db-snapshot-final"

  # Database Deletion Protection
  deletion_protection = "${var.deletion_protection}"

  tags = {
    Owner       = "Assaf Ganon"
    Depaartment = "RnD"
    Environment = "esexample"
  }
}