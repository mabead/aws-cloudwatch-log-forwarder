import cdk = require('@aws-cdk/core');
import kinesis = require('@aws-cdk/aws-kinesis')

export interface CloudWatchLogForwarderProps {
  readonly kinesisProps?: kinesis.StreamProps;
}

export class CloudWatchLogForwarder extends cdk.Construct {

  constructor(scope: cdk.Construct, id: string, props?: CloudWatchLogForwarderProps) {
    super(scope, id);

    new kinesis.Stream(this, 'Stream', props?.kinesisProps);
  }
}

export class ExampleStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new CloudWatchLogForwarder(this, "CloudWatchLogForwarder")
  }
}
