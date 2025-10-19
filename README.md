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

### Connect to DB:
Using AWS RDS

- development: meowie-database-development - use ssm
  ```bash
  aws ssm start-session \
    --target <ec2-instance-id>\
    --document-name AWS-StartPortForwardingSessionToRemoteHost \
    --parameters host="<meowie-database-development-endpoint>",portNumber="5432",localPortNumber="5432"
  ```

### Port

- Preview: 5001
- Production: 5000
- In case you need to change the port, it must be updated in two places: GitHub variables and nginx config
