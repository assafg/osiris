# Running this Example
To run this example you need to first set up the AWS credentials for the account you intend to deploy to


## Set up AWS credentials
see [the official AWS docs](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) for instructions on how to set up the configuration.
The config file should be in *~/.aws/config* and sould be of the form:
```
[default]
aws_access_key_id = XXXYOURACCESSKEYXXX
aws_secret_access_key = XXXXXXXXXYOURAWSSECRETXXXXXXXXXX
```

## Serverles CLI
Once AWS credentials are set, you need to install the serverless command line tool:

```sh
npm i -g serveless
```

Once installed, go into the example directory and runthe deploy command:

```sh
sls deply
```

## Posting data to the endpoint

```sh
curl \
    --header "Content-Type: application/json" \
    --request POST \
    --data '{"score": 150, "context": "john"}' \
    https://XXXXXXXXX.execute-api.us-east-1.amazonaws.com/dev/handle-score-event
```

## Getting the state

```sh
curl https://XXXXXXXXX.execute-api.us-east-1.amazonaws.com/dev/get-state/john
```

## Testing locally
install local dynamo db replica:

```sh
sls dynamodb install
sls dynamodb start --migrate
```