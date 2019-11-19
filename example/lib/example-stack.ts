import core = require('@aws-cdk/core');
import kinesis = require('@aws-cdk/aws-kinesis')
import lambda = require('@aws-cdk/aws-lambda');
import path = require('path');

export interface CloudWatchLogForwarderProps {
  readonly kinesisProps?: kinesis.StreamProps;
}

export class CloudWatchLogForwarder extends core.Construct {

  constructor(scope: core.Construct, id: string, props?: CloudWatchLogForwarderProps) {
    super(scope, id);

    new kinesis.Stream(this, 'Stream', props?.kinesisProps);
    
    new lambda.Function(this, 'SetExpiry', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'resources', 'SetExpiry.js'))});      
  } 
}

export class ExampleStack extends core.Stack {
  constructor(scope: core.Construct, id: string, props?: core.StackProps) {
    super(scope, id, props);

    new CloudWatchLogForwarder(this, "CloudWatchLogForwarder")
  }
}
