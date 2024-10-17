import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AppStack } from "../lib/stack/foundation-web-app-stack";
import { devParameter } from "../parameter";

const app = new cdk.App();

const ec2app = new AppStack(app, "FoundationWebApp", {
  description: "Foundation Web App (tag:foundation-web-app)",
  env: {
    account: devParameter.env?.account || process.env.CDK_DEFAULT_ACCOUNT,
    region: devParameter.env?.region || process.env.CDK_DEFAULT_REGION,
  },
  tags: {
    Environment: devParameter.envName,
  },

  vpcCidr: devParameter.vpcCidr,
});
