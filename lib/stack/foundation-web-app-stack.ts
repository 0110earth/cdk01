import { Names, Stack, StackProps } from "aws-cdk-lib";
import { Key } from "aws-cdk-lib/aws-kms";
import { Construct } from "constructs";
import { Ec2App } from "../construct/ec2app";
import { Networking } from "../construct/networking";
import { Datastore } from "../construct/datastore";
import { ITopic } from "aws-cdk-lib/aws-sns";
import { ILoadBalancerV2 } from "aws-cdk-lib/aws-elasticloadbalancingv2";
import { IAlarm } from "aws-cdk-lib/aws-cloudwatch";

export interface AppStackProps extends StackProps {
  vpcCidr: string;
}

export class AppStack extends Stack {
  public readonly alarmTopic: ITopic;
  public readonly alb: ILoadBalancerV2;
  public readonly albFullName: string;
  public readonly albTargetGroupName: string;
  public readonly albTargetGroupUnhealthyHostCountAlarm: IAlarm;
  public readonly dbClusterName: string;

  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const cmk = new Key(this, "CMK", {
      enableKeyRotation: true,
      description: "BLEA Guest Sample: CMK for Ec2App",
      alias: Names.uniqueResourceName(this, {}),
    });

    const networking = new Networking(this, "Networking", {
      vpcCidr: props.vpcCidr,
    });

    const ec2app = new Ec2App(this, "Ec2App", {
      cmk: cmk,
      vpc: networking.vpc,
    });
    this.alb = ec2app.alb;
    this.albFullName = ec2app.albFullName;
    this.albTargetGroupName = ec2app.albTargetGroupName;
    this.albTargetGroupUnhealthyHostCountAlarm =
      ec2app.albTargetGroupUnhealthyHostCountAlarm;

    const datastore = new Datastore(this, "Datastore", {
      cmk: cmk,
      vpc: networking.vpc,
    });
    this.dbClusterName = datastore.dbCluster.clusterIdentifier;
  }
}
