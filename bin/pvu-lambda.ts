#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { PvuLambdaStack } from '../lib/pvu-lambda-stack';

const app = new cdk.App();
new PvuLambdaStack(app, 'PvuLambdaStack', {
  env: { account: '366273906188', region: 'us-west-2' },
});
