# Deployment Guide

## Overview

The Medication Management application uses a serverless deployment strategy with AWS services. The backend is deployed using AWS SAM (Serverless Application Model), which creates a CloudFormation stack containing all necessary resources. The frontend is deployed to S3 and served through AWS Amplify.

## Backend Deployment

### Prerequisites

- AWS CLI installed and configured
- AWS SAM CLI installed
- Docker installed (for local testing and building Lambda layers)
- Node.js and npm

### Deployment Steps

1. **Build the application**

```bash
npm run build
```

This builds the Prisma layer, shared types, frontend, and backend.

2. **Deploy using AWS SAM**

```bash
sam deploy --guided
```

For subsequent deployments:

```bash
sam deploy
```

The SAM deployment process:
- Creates a CloudFormation stack with all resources defined in `template.yaml`
- Sets up API Gateway with JWT authorization
- Deploys Lambda functions with the Prisma layer
- Creates VPC, subnets, and security groups
- Provisions RDS PostgreSQL database
- Creates necessary secrets in AWS Secrets Manager

3. **Note the API Gateway URL**

After deployment completes, SAM will output the API Gateway endpoint URL. This URL will be needed for the frontend deployment.

## Frontend Deployment

1. **Build the frontend**

```bash
cd frontend
npm run build
```

This creates optimized production files in the `dist` directory.

2. **Create an S3 bucket for each environment**

```bash
aws s3 mb s3://medication-management-frontend-dev
aws s3 mb s3://medication-management-frontend-staging
aws s3 mb s3://medication-management-frontend-prod
```

3. **Upload frontend assets to S3**

```bash
aws s3 sync dist/ s3://medication-management-frontend-{environment}
```

4. **Create Amplify hosting from the S3 bucket**

- Go to AWS Amplify console
- Choose "Host a web app"
- Select "Deploy without Git provider"
- Connect to the S3 bucket
- Configure environment variables:
  - Set `VITE_API_URL` to the API Gateway URL from the SAM deployment

## Environment Management

The deployment supports multiple environments (dev, staging, prod) through:

1. **CloudFormation Parameters**

The `template.yaml` includes an `Environment` parameter that can be set during deployment:

```bash
sam deploy --parameter-overrides Environment=prod
```

2. **Separate S3 buckets for frontend assets**

Each environment has its own S3 bucket for frontend assets:
- `medication-management-frontend-dev`
- `medication-management-frontend-staging`
- `medication-management-frontend-prod`

3. **Database isolation**

The CloudFormation template creates separate VPC and RDS instances for each environment, ensuring complete isolation of resources.

## Database Migrations

Database migrations are handled through Prisma. The commented-out `DatabaseMigrationFunction` in the template.yaml shows the intended approach for running migrations in the cloud environment.

Currently, migrations need to be run manually after deployment:

```bash
cd backend/medication-management-api/api
npx prisma migrate deploy
```

**Note:** There are ongoing challenges with running migrations in the serverless environment. A more robust solution is planned for future iterations.

## Monitoring and Logging

The deployment includes:

- CloudWatch Logs for Lambda functions
- Application Insights monitoring
- X-Ray tracing for API Gateway and Lambda functions

## Security Considerations

The deployment includes several security features:

- JWT authentication at both API Gateway and Lambda levels
- Secrets stored in AWS Secrets Manager
- VPC isolation for database resources
- HTTPS for all API endpoints
- Database encryption at rest

## Troubleshooting

If you encounter deployment issues:

1. Check CloudFormation events:
```bash
aws cloudformation describe-stack-events --stack-name medication-management
```

2. Check Lambda logs in CloudWatch:
```bash
aws logs get-log-events --log-group-name /aws/lambda/medication-management-MedicationManagementFunction
```

3. Verify database connectivity:
```bash
aws rds describe-db-instances --db-instance-identifier medication-management-DatabaseInstance
```
