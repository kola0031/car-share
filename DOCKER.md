# Docker Setup Guide

This guide explains how to build and run the Car Share application using Docker.

## Prerequisites

- Docker installed on your system
- Docker Compose (optional, but recommended)

## Quick Start

### Using Docker Compose (Recommended)

1. **Create a `.env` file** in the root directory (optional):
   ```env
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   NODE_ENV=production
   ```

2. **Build and start the container**:
   ```bash
   docker-compose up -d
   ```

3. **View logs**:
   ```bash
   docker-compose logs -f app
   ```

4. **Stop the container**:
   ```bash
   docker-compose down
   ```

5. **Rebuild after code changes**:
   ```bash
   docker-compose up -d --build
   ```

### Using Docker directly

1. **Build the image**:
   ```bash
   docker build -t car-share .
   ```

2. **Run the container**:
   ```bash
   docker run -d \
     --name car-share-app \
     -p 3001:3001 \
     -e PORT=3001 \
     -e JWT_SECRET=your-super-secret-jwt-key-change-this-in-production \
     -e NODE_ENV=production \
     -v $(pwd)/server/data:/app/server/data \
     car-share
   ```

3. **View logs**:
   ```bash
   docker logs -f car-share-app
   ```

4. **Stop the container**:
   ```bash
   docker stop car-share-app
   docker rm car-share-app
   ```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-jwt-key-change-this-in-production` |
| `NODE_ENV` | Environment mode | `production` |

## Data Persistence

The `server/data` directory is mounted as a volume, so your JSON data files will persist between container restarts. This includes:
- Users
- Hosts
- Drivers
- Vehicles
- Reservations
- Bookings
- Trips
- And other data files

## Accessing the Application

Once the container is running:
- **Frontend**: `http://localhost:3001`
- **API**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/api/health`

## Development vs Production

The Docker setup is configured for **production** mode:
- Frontend is built and served as static files
- Only production dependencies are installed
- Frontend and backend are served from the same container

For development, continue using:
```bash
npm run dev:all
```

## Troubleshooting

### Port already in use
If port 3001 is already in use, change it in your `.env` file or docker-compose.yml:
```yaml
ports:
  - "3002:3002"
```
And set `PORT=3002` in your environment variables.

### Container won't start
Check the logs:
```bash
docker-compose logs app
```

### Data not persisting
Ensure the volume mount is correct in docker-compose.yml:
```yaml
volumes:
  - ./server/data:/app/server/data
```

### Rebuild after dependency changes
If you update `package.json`, rebuild the image:
```bash
docker-compose up -d --build
```

## Production Deployment

For production deployment:

1. **Set a strong JWT_SECRET**:
   ```env
   JWT_SECRET=$(openssl rand -base64 32)
   ```

2. **Use environment-specific configuration**:
   - Set `NODE_ENV=production`
   - Configure proper CORS origins if needed
   - Set up proper database (if migrating from JSON files)

3. **Use a reverse proxy** (nginx, traefik, etc.) for:
   - SSL/TLS termination
   - Domain routing
   - Load balancing (if scaling)

4. **Set up monitoring**:
   - Health checks are already configured
   - Monitor container logs
   - Set up alerting for health check failures

