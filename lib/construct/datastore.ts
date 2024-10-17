import {
  aws_kms as kms,
  aws_rds as rds,
  aws_ec2 as ec2,
  RemovalPolicy,
} from "aws-cdk-lib";
import { IDatabaseCluster } from "aws-cdk-lib/aws-rds";
import { Construct } from "constructs";

export interface DatastoreProps {
  vpc: ec2.IVpc;
  cmk: kms.IKey;
}

export class Datastore extends Construct {
  public readonly dbCluster: IDatabaseCluster;

  constructor(scope: Construct, id: string, props: DatastoreProps) {
    super(scope, id);

    //Security Group of App for Db
    const dbSg = new ec2.SecurityGroup(this, "DbSg", {
      vpc: props.vpc,
      allowAllOutbound: true,
    });
    dbSg.addIngressRule(dbSg, ec2.Port.tcp(5432));

    // Create RDS PostgreSQL Instance
    const cluster = new rds.DatabaseCluster(this, "AuroraCluster", {
      // for Aurora PostgreSQL
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_11_9,
      }),
      // for Aurora MySQL
      // engine: rds.DatabaseClusterEngine.auroraMysql({
      //   version: rds.AuroraMysqlEngineVersion.VER_2_09_1
      // }),
      credentials: rds.Credentials.fromGeneratedSecret("dbadmin"),
      vpc: props.vpc,
      vpcSubnets: props.vpc.selectSubnets({
        subnetGroupName: "Private",
      }),
      writer: rds.ClusterInstance.provisioned("Instance1", {
        instanceIdentifier: "Datastore1",
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.T4G,
          ec2.InstanceSize.LARGE
        ),
        enablePerformanceInsights: true,
        performanceInsightEncryptionKey: props.cmk,
        performanceInsightRetention: rds.PerformanceInsightRetention.DEFAULT, // 7 days
        isFromLegacyInstanceProps: true,
      }),
      readers: [
        rds.ClusterInstance.provisioned("Instance2", {
          instanceIdentifier: "Datastore2",
          instanceType: ec2.InstanceType.of(
            ec2.InstanceClass.T4G,
            ec2.InstanceSize.LARGE
          ),
          enablePerformanceInsights: true,
          performanceInsightEncryptionKey: props.cmk,
          performanceInsightRetention: rds.PerformanceInsightRetention.DEFAULT, // 7 days
          isFromLegacyInstanceProps: true,
        }),
      ],
      securityGroups: [dbSg],
      removalPolicy: RemovalPolicy.SNAPSHOT,
      defaultDatabaseName: "mydb",
      storageEncrypted: true,
      storageEncryptionKey: props.cmk,
      instanceIdentifierBase: id,
    });
    this.dbCluster = cluster;
  }
}
