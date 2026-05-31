# NISO Deployment to Staging

## Quick Start (5 minutes)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Docker (optional, for database)

### 1. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database URL

# Initialize database
npx prisma migrate deploy
npx prisma db seed

# Start server
npm run dev
# Server runs on http://localhost:3001
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# .env already points to http://localhost:3001/api

# Start dev server
npm run dev
# App runs on http://localhost:3000
```

### 3. Test Login

Demo credentials:
- **Email**: operator@station.ng
- **Password**: password123

## Demo User Roles

```sql
-- Insert demo users (after db seed)
INSERT INTO "User" (id, email, "passwordHash", "fullName", "roleId", "stationId", "regionId", "isActive", "createdAt")
VALUES 
  ('user_op', 'operator@station.ng', '$2b$12$...', 'John Operator', 'role_op', 'stn_001', NULL, true, NOW()),
  ('user_sv', 'supervisor@station.ng', '$2b$12$...', 'Jane Supervisor', 'role_sv', 'stn_001', NULL, true, NOW()),
  ('user_sa', 'admin@station.ng', '$2b$12$...', 'Bob Admin', 'role_sa', 'stn_001', 'rgn_001', true, NOW());
```

## Production Deployment (AWS)

### 1. Database (RDS)

```bash
# Create PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier niso-prod \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --allocated-storage 100 \
  --backup-retention-period 7 \
  --multi-az

# Get endpoint
aws rds describe-db-instances \
  --db-instance-identifier niso-prod \
  --query 'DBInstances[0].Endpoint.Address'
```

### 2. Backend (ECS)

```bash
# Build Docker image
docker build -t niso-backend:latest -f backend/docker/Dockerfile .

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag niso-backend:latest <account>.dkr.ecr.us-east-1.amazonaws.com/niso-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/niso-backend:latest

# Deploy to ECS (update task definition with new image)
aws ecs update-service --cluster niso-prod --service niso-backend --force-new-deployment
```

### 3. Frontend (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
VITE_API_URL=https://api.niso.tcn.ng/api
```

## Docker Compose (Local Stack)

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_USER: niso
      POSTGRES_PASSWORD: niso_dev_pw
      POSTGRES_DB: niso
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: backend/docker/Dockerfile
    environment:
      DATABASE_URL: postgresql://niso:niso_dev_pw@postgres:5432/niso
      JWT_SECRET: dev-secret-key
      NODE_ENV: development
      PORT: 3001
    ports:
      - "3001:3001"
    depends_on:
      - postgres

  frontend:
    build:
      context: .
      dockerfile: frontend/docker/Dockerfile
    environment:
      VITE_API_URL: http://localhost:3001/api
    ports:
      - "3000:3000"
    depends_on:
      - backend

volumes:
  postgres_data:
```

Run with: `docker-compose up`

## Health Check

```bash
# Backend health
curl http://localhost:3001/api/health

# Response should be:
{
  "status": "healthy",
  "checks": {
    "database": "ok"
  }
}
```

## Troubleshooting

### Database Connection Failed
```bash
# Check connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"
```

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti :3001 | xargs kill -9

# Or use different port
PORT=3002 npm run dev
```

### Migration Issues
```bash
# Reset database (dev only!)
npx prisma migrate reset

# View migration status
npx prisma migrate status
```

## API Testing

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"operator@station.ng","password":"password123"}'
```

### Create Reading
```bash
curl -X POST http://localhost:3001/api/stations/stn_001/readings \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "equipmentId": "eq_001",
    "date": "2024-01-15",
    "hour": 14,
    "rawInput": "330.5",
    "valueType": "number"
  }'
```

## Monitoring

### Logs
```bash
# Backend logs
npm run dev 2>&1 | tee backend.log

# Frontend logs
npm run dev 2>&1 | tee frontend.log
```

### Database Queries
```bash
# Enable Prisma logging
DATABASE_LOG=query npm run dev
```

## Next Steps

1. **Seed Production Data**: Run `npx prisma db seed` with production data
2. **Setup Monitoring**: Configure CloudWatch / DataDog alerts
3. **Configure Backups**: Setup automated RDS backups
4. **SSL Certificates**: Obtain and configure HTTPS
5. **Load Testing**: Test with realistic data volume
6. **User Training**: Deploy and train TCN team

## Support

- **Backend Issues**: Check `backend/README.md`
- **Frontend Issues**: Check `frontend/README.md`
- **Database Issues**: Check `DEPLOYMENT_OPERATIONS.md`
- **API Docs**: See `API_SPEC.md`

---

**Deployment Status**: Ready for staging ✅
