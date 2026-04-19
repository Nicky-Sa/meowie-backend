# Backend for Meowie

_Backend for a movie discovery app. Built with NestJS and deployed on AWS_

### Deploy:

- 2 environments:
    - preview: https://preview.api.meowie.app
    - production: https://api.meowie.app
- Env variables defined in GitHub secrets
- Dockerfile for building an image
- ECR for storing images
- AWS Lightsail instance for running the app
- GitHub actions for CI/CD
- CloudFront for caching and SSL termination


### Create or Update OTP template

1. Edit the HTML in `src/otp/otp.template.html`.
2. It will update that next time you run the app in `OnModuleInit` of the OTP Module.


### Port

- Preview: 5001
- Production: 5000


### Class vs type for DTOs

- Class-validator is used for validation, so we need classes for Request DTOs
- Response DTOs are just types
