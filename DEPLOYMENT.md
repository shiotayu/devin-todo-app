# Deployment Guide

## Current Deployment Process

The TODO app is currently deployed manually using Devin's deployment system. Here's the process:

### Manual Deployment Steps

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Deploy using Devin's deployment command**:
   ```bash
   # This is done through Devin's deployment system
   # Current deployment URL: https://todo-app-lzzpuzmq.devinapps.com/
   ```

### Automated Deployment (GitHub Actions)

A GitHub Actions workflow has been created in `.github/workflows/deploy.yml` that:

- Triggers on pushes to the `main` branch
- Builds the React application using `npm run build`
- Attempts to deploy using Devin's deployment API

**Note**: The deployment step in the GitHub Actions workflow is currently a placeholder and needs to be configured with the correct Devin deployment API endpoints and authentication.

### Environment Configuration

The app supports both local and production environments:

- **Local Development**: Uses Docker PostgreSQL database
- **Production**: Uses Supabase for authentication and database

Environment switching is controlled by the `VITE_USE_LOCAL_DB` variable in `.env`.

### Security Features

The app includes comprehensive security measures:

- User data isolation with proper `user_id` filtering
- Row Level Security (RLS) policies in Supabase
- Unique user ID generation in development mode
- Server-side validation in local API endpoints

### Future Improvements

To enable fully automated deployment, the following needs to be configured:

1. **Devin API Integration**: Configure the correct API endpoints and authentication for Devin's deployment system
2. **GitHub Secrets**: Add necessary deployment tokens to repository secrets
3. **Testing Pipeline**: Add automated testing before deployment
4. **Rollback Strategy**: Implement deployment rollback capabilities

## Repository Structure

```
├── .github/workflows/deploy.yml  # GitHub Actions workflow
├── src/                          # React frontend source
├── server/                       # Local API server
├── docker-compose.yml           # Local PostgreSQL setup
├── .env                         # Environment configuration
└── dist/                        # Built application (generated)
```
