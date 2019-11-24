import core = require('@aws-cdk/core');
import kinesis = require('@aws-cdk/aws-kinesis')
import lambda = require('@aws-cdk/aws-lambda');
import path = require('path');
import events = require('@aws-cdk/aws-events');
import targets = require('@aws-cdk/aws-events-targets');

export interface CloudWatchLogForwarderProps {
  /**
   * The properties of the kinesis stream. This can be used, for example, if you want to customize the encryption scheme of the Kinesis stream.
   * TODO MAX: do we really want to expose this?
   */
  readonly kinesisProps?: kinesis.StreamProps;

  /**
   * Whenever a CloudWatch log group is created, a lambda will set the retention
   * period of the log group to the following value.
   * 
   * @default 7
   */
  readonly cloudWatchLogGroupsRetentionInDays?: number;
}

export class CloudWatchLogForwarder extends core.Construct {

  constructor(scope: core.Construct, id: string, props?: CloudWatchLogForwarderProps) {
    super(scope, id);

    // TODO MAX
    // new kinesis.Stream(this, 'Stream', props?.kinesisProps);

    const cloudWatchLogGroupsRetentionInDays = props?.cloudWatchLogGroupsRetentionInDays ?? 7;

    const setExpiryLambda = new lambda.Function(this, 'SetExpiry', {
      // TODO MAX: move this customization in client app
      functionName: 'SetCloudWatchLogGroupsRetention',
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'handler.handler',
      description: 'Sets the log retention policy to the specified no. of days',
      memorySize: 128,
      environment: {
        "LOG_GROUP_RETENTION": String(cloudWatchLogGroupsRetentionInDays)
      },
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'resources', 'SetExpiry'))});

    const createLogGroupEventRule = new events.Rule(this, 'CreateLogGroupEvent', {
      // TODO MAX: name event?
      ruleName: 'LogGroupCreated',
      description: 'Fires whenever CloudTrail detects that a log group is created',
      eventPattern: {
        source: [ "aws.logs" ],
        detailType: ["AWS API Call via CloudTrail"],
        detail: {
          eventSource: [
            "logs.amazonaws.com"
          ],
          eventName: [
            "CreateLogGroup"
          ]
        }
      }
    });

    createLogGroupEventRule.addTarget(new targets.LambdaFunction(setExpiryLambda));
  } 
}