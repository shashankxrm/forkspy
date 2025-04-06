# GitHub Secrets for CI/CD

This document outlines the required secrets that need to be set up in your GitHub repository for the CI/CD workflow to function correctly.

## Required Secrets

The following secrets need to be added to your GitHub repository:

| Secret Name | Description |
|-------------|-------------|
| `GH_AUTH_ID` | Your GitHub OAuth App ID used for NextAuth authentication |
| `GH_AUTH_SECRET` | Your GitHub OAuth App Secret used for NextAuth authentication |
| `MONGO_URI` | MongoDB connection string for database access |

## Optional Secrets

These secrets are not required for tests but would be needed for full functionality:

| Secret Name | Description |
|-------------|-------------|
| `RESEND_API_KEY` | API key for the Resend email service (optional for testing) |

## How to Set Up Secrets

1. Navigate to your GitHub repository
2. Click on "Settings" at the top
3. In the left sidebar, click on "Secrets and variables" > "Actions"
4. Click on "New repository secret"
5. Add each of the required secrets with their respective values

## Notes for Development

- For local development, these secrets should be in your `.env.local` file as `GITHUB_ID` and `GITHUB_SECRET`
- The CI workflow automatically maps the GitHub repository secrets to the environment variables expected by NextAuth
- For testing purposes, the workflow uses a dummy Resend API key that the application recognizes as a test key
- Never commit actual secret values to the repository

## Troubleshooting

If CI tests are failing due to authentication or database connection issues:

1. Verify that all required secrets are set correctly
2. Ensure the MongoDB URI is accessible from GitHub Actions
3. Check that the GitHub OAuth credentials have correct callback URLs and permissions 