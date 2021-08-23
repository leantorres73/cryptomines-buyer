import * as cdk from '@aws-cdk/core';
import * as nodeLambda from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from'@aws-cdk/aws-lambda';

export class PvuLambdaStack extends cdk.Stack {
  constructor(scope: any, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new nodeLambda.NodejsFunction(
      this,
      'PVULambda',
      {
        timeout: cdk.Duration.minutes(5),
        runtime: lambda.Runtime.NODEJS_12_X,
        entry: 'src/index.ts',
        environment: {
          DATABASE_NAME: 'pvu',
          DATABASE_PASSWORD: 'test',
          DATABASE_PORT: '3306',
          DATABASE_URL: 'pvu-database.cyhhdssdfyr7.us-west-2.rds.amazonaws.com',
          DATABASE_USER: 'admin'
        },
        handler: 'main'
      }
  );
  }
}
