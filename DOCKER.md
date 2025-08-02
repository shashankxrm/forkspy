# Docker Development Guide for ForkSpy

This guide provides comprehensive instructions for developing ForkSpy using Docker containers.

## Overview

ForkSpy uses Docker to provide a consistent development environment across different machines and operating systems. The Docker setup includes:

- **Development Container**: Hot reloading, volume mounting, and development optimizations
- **Testing Container**: Isolated test environment with consistent results
- **Environment Variables**: Uses your local `.env` file for configuration
- **MongoDB Atlas**: Connects to cloud database (no local database setup needed)

## Prerequisites

- **Docker Desktop** (recommended) or Docker Engine 20.10+
- **Docker Compose** v2.0+
- **Git** for version control

## Project Structure

```
forkspy/
├── Dockerfile.dev              # Development container definition
├── docker-compose.dev.yml      # Development orchestration
├── docker-compose.test.yml     # Testing environment (Phase 2)
├── .dockerignore              # Files to exclude from Docker builds
├── .env                       # Environment variables (copy from .env.local)
└── DOCKER.md                  # This file
```

## Quick Start

### 1. Setup Environment

```bash
# Clone the repository
git clone https://github.com/shashankxrm/forkspy.git
cd forkspy

# Copy environment variables
cp .env.local .env
```

### 2. Start Development Environment

```bash
# Start with Docker Compose
npm run docker:dev

# Alternative: Direct Docker Compose command
docker-compose -f docker-compose.dev.yml up
```

### 3. Access Application

- **Application**: http://localhost:3000
- **Hot Reloading**: Enabled automatically
- **Code Changes**: Reflected instantly in the browser

## Available Commands

```bash
# Development
npm run docker:dev              # Start development environment
npm run docker:dev:build        # Build development image
npm run docker:dev:detached     # Start in background
npm run docker:stop             # Stop development containers

# Testing (Phase 2)
npm run docker:test             # Run all tests in containers
npm run docker:test:down        # Stop test containers

# Utilities
docker ps                       # List running containers
docker logs forkspy-app         # View application logs
docker logs forkspy-test-runner # View test logs  
docker exec -it forkspy-app sh  # Access container shell
```

## Docker Configuration

### Dockerfile.dev

The development Dockerfile:
- Uses Node.js 18 Alpine for smaller image size
- Installs all dependencies (including dev dependencies)
- Sets up hot reloading with `npm run dev`
- Exposes port 3000

### docker-compose.dev.yml

The Docker Compose configuration:
- **Port Mapping**: Maps host port 3000 to container port 3000
- **Volume Mounting**: Mounts source code for hot reloading
- **Environment Variables**: Loads from `.env` file
- **Container Name**: `forkspy-app` for easy identification

### .dockerignore

Excludes unnecessary files from Docker builds:
- `node_modules/` (installed in container)
- `.git/` (version control)
- `.next/` (build artifacts)
- `coverage/` (test reports)
- Log files and IDE configurations

## Development Workflow

### 1. Making Code Changes

1. Edit any file in the project
2. Save the file
3. Docker automatically detects the change
4. Next.js reloads the application
5. Browser refreshes automatically

### 2. Installing New Dependencies

```bash
# Option 1: Rebuild the container (recommended)
npm run docker:dev:build
npm run docker:dev

# Option 2: Install inside running container
docker exec forkspy-app npm install <package-name>
```

### 3. Debugging

```bash
# View real-time logs
docker logs -f forkspy-app

# Access container shell
docker exec -it forkspy-app sh

# Check container status
docker ps
docker inspect forkspy-app
```

## Environment Variables

The Docker setup uses your local `.env` file. Required variables:

```bash
# GitHub OAuth
GITHUB_ID=your_github_oauth_app_id
GITHUB_SECRET=your_github_oauth_app_secret

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/

# Authentication
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

# Email
RESEND_API_KEY=your_resend_api_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## Troubleshooting

### Common Issues

1. **Port 3000 already in use**
   ```bash
   # Find what's using the port
   lsof -i :3000
   
   # Kill the process or use a different port in docker-compose.dev.yml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

2. **Container won't start**
   ```bash
   # Check Docker daemon
   docker info
   
   # View detailed logs
   docker logs forkspy-app
   
   # Rebuild image
   npm run docker:dev:build
   ```

3. **Hot reloading not working**
   ```bash
   # Ensure volumes are mounted correctly
   docker inspect forkspy-app | grep -A 10 "Mounts"
   
   # Check if files are being synced
   docker exec forkspy-app ls -la /app
   ```

4. **Environment variables not loaded**
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Verify variables inside container
   docker exec forkspy-app env | grep GITHUB_ID
   ```

5. **npm commands not working (networking issues)**
   ```bash
   # This error usually indicates orphaned Docker networks:
   # "Error response from daemon: failed to set up container networking"
   
   # Solution: Clean up orphaned networks and containers
   npm run docker:stop              # or docker-compose -f docker-compose.dev.yml down
   docker network prune -f          # Remove orphaned networks
   docker system prune -f           # Remove unused containers/images
   
   # Then try again
   npm run docker:dev
   ```

### Prevention & Best Practices

**Always use proper cleanup commands instead of forceful termination:**

```bash
# ✅ GOOD - Proper cleanup
npm run docker:stop              # Gracefully stop development containers
npm run docker:test:down         # Clean up test containers

# ❌ AVOID - These can leave orphaned networks
# Ctrl+C (while containers are starting)
# Force killing Docker processes
# Changing docker-compose files without cleanup
```

**Regular maintenance commands:**

```bash
# Weekly cleanup (removes unused resources)
docker system prune -f

# Remove all stopped containers
docker container prune -f

# Remove unused networks
docker network prune -f

# Remove unused volumes (be careful with data!)
docker volume prune -f

# See what's taking up space
docker system df
```

**Debugging networking issues:**

```bash
# List all networks
docker network ls

# Inspect a specific network
docker network inspect <network_name>

# List running containers and their networks
docker ps --format "table {{.Names}}\t{{.Networks}}\t{{.Status}}"
```

### Performance Tips

1. **Use .dockerignore**: Ensure unnecessary files are excluded
2. **Volume mounting**: Only mount what you need for development
3. **Restart containers**: If experiencing issues, restart the container
4. **Clean up**: Regularly clean up unused Docker resources

```bash
# Clean up unused resources
docker system prune

# Remove unused volumes
docker volume prune
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **Secrets**: Use strong, unique values for production
3. **Updates**: Keep Docker images updated regularly
4. **Permissions**: Container runs as non-root user when possible

## Next Steps

Once you have Docker development working:

1. **Testing**: Set up Docker-based testing environment
2. **Production**: Create production Docker configuration
3. **CI/CD**: Integrate Docker builds into GitHub Actions
4. **Deployment**: Deploy containers to cloud platforms

## Support

If you encounter issues with Docker setup:

1. Check this documentation first
2. Look at existing [GitHub Issues](https://github.com/shashankxrm/forkspy/issues)
3. Create a new issue with:
   - Your operating system
   - Docker version (`docker --version`)
   - Error messages and logs
   - Steps to reproduce

---

**Happy coding with Docker! 🐳**
