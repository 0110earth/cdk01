import { Environment } from "aws-cdk-lib";

// Parameters for Application
export interface AppParameter {
  env?: Environment;
  envName: string;
  vpcCidr: string;
}

// Example
export const devParameter: AppParameter = {
  envName: "Development",
  vpcCidr: "10.100.0.0/16",
};
