# Backend for Meowie

_a movie discovery app. Built with NestJS and deployed on AWS Elastic Beanstalk._

### Deploy:

- 2 environments:
    - preview: https://preview.api.meowie.app
    - production: https://api.meowie.app
- Env variables defined in GitHub secrets and variables and pulled in during deploy via SSM
- Dockerfile for building image
- ECR for storing images
- SSM for deploying to EC2
- GitHub actions for CI/CD
- Installed Nginx on EC2 instance and configured certbot for SSL -> Check `/home/ubuntu
/meowie-backend/[ENV]/nginx` for more info

### Local dev, passing security groups on AWS:

Run `sh init-dev.sh` to start port forwarding to ElastiCache and RDS.

### Creat or Update OTP template

```bash
aws ses create-template --cli-input-json file://src/otp/otp.template.json --region eu-central-1
aws ses update-template --cli-input-json file://src/otp/otp.template.json --region eu-central-1

```

### Port

- Preview: 5001
- Production: 5000
- In case you need to change the port, it must be updated in two places: GitHub variables and nginx config
