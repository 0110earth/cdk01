import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { BLEAEc2AppStack } from "../lib/stack/web-foundation-app-stack";
import { devParameter } from "../parameter";
const app = new cdk.App();

new BLEAEc2AppStack(app, "Dev-BLEAEc2App", {
  description: "WebApplication foundation (tag:web-foundation-app)",
  env: {
    account: devParameter.env?.account || process.env.CDK_DEFAULT_ACCOUNT,
    region: devParameter.env?.region || process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    Repository: "aws-samples/baseline-environment-on-aws",
    Environment: devParameter.envName,
  },

  vpcCidr: devParameter.vpcCidr,
});
