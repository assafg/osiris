# Create infra

## Quick Start / In a nutshell

All modules are desinged to be self contained you could basically do somthing like:

```sh
pushd $dir
terraform init
terraform plan -out `basename $PWD`.plan && \
terraform apply `basename $PWD`.plan
```

Which is basically what `terraform`'s life-cycle brings to the table.

Upong successfule eecution you shluld be able to:

```sh
terraform output db_url
esexample.cjftwggzkv59.eu-west-1.rds.amazonaws.com
```

Use pgsql client to connect to host `esexample.cjftwggzkv59.eu-west-1.rds.amazonaws.com` with username / pass provided in `test.tdvars`

The url may differ of course ...

Cleanup:
terraform destroy

Full desc below:

## Under the hood

> Please note this isn't a terraform best practices and the following exmaple was designed the `quick way to get things done`, in real life I assume this would be a single module in the mix rather than a stand alone resource ...


1. Terraform stadart structure:

    ```sh
    .
    ├── README.md       - This file 
    ├── main.tf         - Creates RDS instance
    ├── providers.tf    - Configure AWS profile + region etc
    ├── test.tfvars     - Variable file to use in CI/CD mode (profile,region,etc)
    └── sgs.tf          - Optionally creates a security group allowing 0.0.0.0/0:5432
    ```

2. Use input file `test.tfvars` like so:

    ```sh
    terraform plan -var-file=test.tfvars -out rds.plan
    ```

3. Should yield 4 resoruces:

    **Please note:** if you set the `create_sg` to `false` you will have to either pass an alternative sg.

    ```sh
    $ terraform plan -var-file=test.tfvars -out `dirname $PWD`.plan
    Refreshing Terraform state in-memory prior to plan...
    The refreshed state will be used to calculate this plan, but will not be
    persisted to local or remote state storage.

    data.aws_vpc.default: Refreshing state...
    data.aws_subnet_ids.all: Refreshing state...
    data.aws_security_group.default: Refreshing state...

    ------------------------------------------------------------------------

    An execution plan has been generated and is shown below.
    Resource actions are indicated with the following symbols:
    + create

    Terraform will perform the following actions:

    + aws_security_group.rds_potgress_allow
        id:                                    <computed>
        arn:                                   <computed>
        ...
        vpc_id:                                "vpc-xxxxxxx"

    + module.db.module.db_instance.aws_db_instance.this
        id:                                    <computed>
        address:                               <computed>
        allocated_storage:                     "2"
        allow_major_version_upgrade:           "false"
        apply_immediately:                     "false"
        arn:                                   <computed>
        auto_minor_version_upgrade:            "true"
        availability_zone:                     <computed>
        backup_retention_period:               "14"
        backup_window:                         "00:00-00:30"
        ca_cert_identifier:                    <computed>
        character_set_name:                    <computed>
        copy_tags_to_snapshot:                 "false"
        db_subnet_group_name:                  "${var.db_subnet_group_name}"
        deletion_protection:                   "true"
        endpoint:                              <computed>
        engine:                                "postgres"
        engine_version:                        "10.6"
        final_snapshot_identifier:             "esexample-db-snapshot-final"
        hosted_zone_id:                        <computed>
        iam_database_authentication_enabled:   "false"
        identifier:                            "esexample"
        identifier_prefix:                     <computed>
        instance_class:                        "db.t2.micro"
        iops:                                  "0"
        kms_key_id:                            <computed>
        license_model:                         <computed>
        maintenance_window:                    "mon:01:00-mon:01:30"
        monitoring_interval:                   "0"
        monitoring_role_arn:                   <computed>
        multi_az:                              "false"
        name:                                  "esexample"
        option_group_name:                     <computed>
        parameter_group_name:                  "${var.parameter_group_name}"
        password:                              <sensitive>
        port:                                  "5432"
        publicly_accessible:                   "true"
        replicas.#:                            <computed>
        resource_id:                           <computed>
        skip_final_snapshot:                   "true"
        status:                                <computed>
        storage_encrypted:                     "false"
        storage_type:                          "gp2"
        tags.%:                                "4"
        tags.Depaartment:                      "R&D"
        tags.Environment:                      "esexample"
        tags.Name:                             "esexample"
        tags.Owner:                            "Assaf Ganon"
        timezone:                              <computed>
        username:                              "example"
        vpc_security_group_ids.#:              "1"
        vpc_security_group_ids.3859036203:     "sg-4538d72a"

    + module.db.module.db_parameter_group.aws_db_parameter_group.this
        id:                                    <computed>
        arn:                                   <computed>
        description:                           "Database parameter group for esexample"
        family:                                "postgres10"
        name:                                  <computed>
        name_prefix:                           "esexample-"
        ...

    + module.db.module.db_subnet_group.aws_db_subnet_group.this
        id:                                    <computed>
        arn:                                   <computed>
        description:                           "Database subnet group for esexample"
        ...

    Plan: 4 to add, 0 to change, 0 to destroy.
    ```

4. Apply the plan - could take up to 10 min

    ```sh
    terraform plan -out `basename $PWD`.plan  -var-file=test.tfvars
    Refreshing Terraform state in-memory prior to plan...
    The refreshed state will be used to calculate this plan, but will not be
    persisted to local or remote state storage.

    aws_db_parameter_group.this: Refreshing state... (ID: esexample-20190317235457552100000002)
    data.aws_vpc.default: Refreshing state...
    ^[[A^[[Adata.aws_subnet_ids.all: Refreshing state...
    data.aws_security_group.default: Refreshing state...
    aws_db_subnet_group.this: Refreshing state... (ID: esexample-20190317235457552000000001)

    ------------------------------------------------------------------------

    An execution plan has been generated and is shown below.
    Resource actions are indicated with the following symbols:
    + create

    Terraform will perform the following actions:

    + module.db.module.db_instance.aws_db_instance.this
        id:                                  <computed>
        address:                             <computed>
        allocated_storage:                   "10"
        allow_major_version_upgrade:         "false"
        apply_immediately:                   "false"
        arn:                                 <computed>
        auto_minor_version_upgrade:          "true"
        availability_zone:                   <computed>
        backup_retention_period:             "14"
        backup_window:                       "00:00-00:30"
        ca_cert_identifier:                  <computed>
        character_set_name:                  <computed>
        copy_tags_to_snapshot:               "false"
        db_subnet_group_name:                "esexample-20190317235457552000000001"
        deletion_protection:                 "true"
        endpoint:                            <computed>
        engine:                              "postgres"
        engine_version:                      "10.6"
        final_snapshot_identifier:           "esexample-db-snapshot-final"
        hosted_zone_id:                      <computed>
        iam_database_authentication_enabled: "false"
        identifier:                          "esexample"
        identifier_prefix:                   <computed>
        instance_class:                      "db.t2.micro"
        iops:                                "0"
        kms_key_id:                          <computed>
        license_model:                       <computed>
        maintenance_window:                  "mon:01:00-mon:01:30"
        monitoring_interval:                 "0"
        monitoring_role_arn:                 <computed>
        multi_az:                            "false"
        name:                                "esexample"
        option_group_name:                   <computed>
        parameter_group_name:                "esexample-20190317235457552100000002"
        password:                            <sensitive>
        port:                                "5432"
        publicly_accessible:                 "true"
        replicas.#:                          <computed>
        resource_id:                         <computed>
        skip_final_snapshot:                 "true"
        status:                              <computed>
        storage_encrypted:                   "false"
        storage_type:                        "gp2"
        tags.%:                              "4"
        tags.Depaartment:                    "RnD"
        tags.Environment:                    "esexample"
        tags.Name:                           "esexample"
        tags.Owner:                          "Assaf Ganon"
        timezone:                            <computed>
        username:                            "example"
        vpc_security_group_ids.#:            "1"
        vpc_security_group_ids.3859036203:   "sg-4538d72a"


    Plan: 1 to add, 0 to change, 0 to destroy.

    ------------------------------------------------------------------------

    This plan was saved to: infra.plan

    To perform exactly these actions, run the following command to apply:
        terraform apply "infra.plan"

    hagzags-mac:infra hagzag$ terraform apply infra.plan
    module.db.module.db_instance.aws_db_instance.this: Creating...
    address:                             "" => "<computed>"
    allocated_storage:                   "" => "10"
    allow_major_version_upgrade:         "" => "false"
    apply_immediately:                   "" => "false"
    arn:                                 "" => "<computed>"
    auto_minor_version_upgrade:          "" => "true"
    availability_zone:                   "" => "<computed>"
    backup_retention_period:             "" => "14"
    backup_window:                       "" => "00:00-00:30"
    ca_cert_identifier:                  "" => "<computed>"
    character_set_name:                  "" => "<computed>"
    copy_tags_to_snapshot:               "" => "false"
    db_subnet_group_name:                "" => "esexample-20190317235457552000000001"
    deletion_protection:                 "" => "true"
    endpoint:                            "" => "<computed>"
    engine:                              "" => "postgres"
    engine_version:                      "" => "10.6"
    final_snapshot_identifier:           "" => "esexample-db-snapshot-final"
    hosted_zone_id:                      "" => "<computed>"
    iam_database_authentication_enabled: "" => "false"
    identifier:                          "" => "esexample"
    identifier_prefix:                   "" => "<computed>"
    instance_class:                      "" => "db.t2.micro"
    iops:                                "" => "0"
    kms_key_id:                          "" => "<computed>"
    license_model:                       "" => "<computed>"
    maintenance_window:                  "" => "mon:01:00-mon:01:30"
    monitoring_interval:                 "" => "0"
    monitoring_role_arn:                 "" => "<computed>"
    multi_az:                            "" => "false"
    name:                                "" => "esexample"
    option_group_name:                   "" => "<computed>"
    parameter_group_name:                "" => "esexample-20190317235457552100000002"
    password:                            "<sensitive>" => "<sensitive>"
    port:                                "" => "5432"
    publicly_accessible:                 "" => "true"
    replicas.#:                          "" => "<computed>"
    resource_id:                         "" => "<computed>"
    skip_final_snapshot:                 "" => "true"
    status:                              "" => "<computed>"
    storage_encrypted:                   "" => "false"
    storage_type:                        "" => "gp2"
    tags.%:                              "" => "4"
    tags.Depaartment:                    "" => "RnD"
    tags.Environment:                    "" => "esexample"
    tags.Name:                           "" => "esexample"
    tags.Owner:                          "" => "Assaf Ganon"
    timezone:                            "" => "<computed>"
    username:                            "" => "example"
    vpc_security_group_ids.#:            "" => "1"
    vpc_security_group_ids.3859036203:   "" => "sg-4538d72a"
    module.db.db_instance.aws_db_instance.this: Still creating... (10s elapsed)
    module.db.db_instance.aws_db_instance.this: Still creating... (1m30s elapsed)
    ...
    
    module.db.db_instance.aws_db_instance.this: Still creating... (8m0s elapsed)
    module.db.module.db_instance.aws_db_instance.this: Creation complete after 8m3s (ID: esexample)

    Apply complete! Resources: 1 added, 0 changed, 0 destroyed.
    ```

5. Cleanup

    ```sh
    terraform destroy  -var-file=test.tfvars
    aws_db_parameter_group.this: Refreshing state... (ID: esexample-20190317235457552100000002)
    data.aws_vpc.default: Refreshing state...
    data.aws_security_group.default: Refreshing state...
    data.aws_subnet_ids.all: Refreshing state...
    aws_db_subnet_group.this: Refreshing state... (ID: esexample-20190317235457552000000001)
    aws_db_instance.this: Refreshing state... (ID: esexample)

    An execution plan has been generated and is shown below.
    Resource actions are indicated with the following symbols:
    - destroy

    Terraform will perform the following actions:

    - module.db.module.db_instance.aws_db_instance.this

    - module.db.module.db_parameter_group.aws_db_parameter_group.this

    - module.db.module.db_subnet_group.aws_db_subnet_group.this


    Plan: 0 to add, 0 to change, 3 to destroy.

    Do you really want to destroy all resources?
    Terraform will destroy all your managed infrastructure, as shown above.
    There is no undo. Only 'yes' will be accepted to confirm.

    Enter a value: yes

    module.db.module.db_instance.aws_db_instance.this: Destroying... (ID: esexample)
    module.db.db_instance.aws_db_instance.this: Still destroying... (ID: esexample, 10s elapsed)
    module.db.db_instance.aws_db_instance.this: Still destroying... (ID: esexample, 20s elapsed)
    ...
    module.db.db_instance.aws_db_instance.this: Still destroying... (ID: esexample, 1m40s elapsed)
    module.db.db_instance.aws_db_instance.this: Still destroying... (ID: esexample, 1m50s elapsed)
    module.db.module.db_instance.aws_db_instance.this: Destruction complete after 1m56s
    module.db.module.db_parameter_group.aws_db_parameter_group.this: Destroying... (ID: esexample-20190317235457552100000002)
    module.db.module.db_subnet_group.aws_db_subnet_group.this: Destroying... (ID: esexample-20190317235457552000000001)
    module.db.module.db_subnet_group.aws_db_subnet_group.this: Destruction complete after 0s
    module.db.module.db_parameter_group.aws_db_parameter_group.this: Destruction complete after 0s

    Destroy complete! Resources: 3 destroyed.
    ```