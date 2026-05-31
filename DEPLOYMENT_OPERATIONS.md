# NISO Deployment & Operations Guide

## Pre-Deployment Checklist

### Infrastructure Requirements

```
┌─────────────────────────────────────────┐
│         NISO Infrastructure              │
├─────────────────────────────────────────┤
│ Frontend: Cloudflare Pages / Vercel     │
│ Backend: AWS ECS / EC2 / DigitalOcean   │
│ Database: AWS RDS PostgreSQL 14+        │
│ Cache: Redis (ElastiCache / Upstash)    │
│ Storage: S3 / GCS (photos, exports)     │
│ Queue: SQS / Bull (background jobs)     │
│ Monitoring: DataDog / New Relic         │
│ Logging: CloudWatch / Splunk / ELK      │
│ CDN: Cloudflare / AWS CloudFront        │
└─────────────────────────────────────────┘
```

### Security Pre-Checks

- [ ] Database: PostgreSQL user with minimal privileges (no superuser)
- [ ] Secrets: All in AWS Secrets Manager / HashiCorp Vault (never in git)
- [ ] HTTPS: Valid SSL certificate (Let's Encrypt for staging)
- [ ] CORS: Configured for frontend origin only
- [ ] Rate Limiting: 100 req/min on auth endpoints
- [ ] SQL Injection: ✓ Prisma parameterized queries
- [ ] XSS Prevention: ✓ Input validation + output encoding
- [ ] CSRF: ✓ JWT tokens (stateless, no cookies needed)
- [ ] DDoS: ✓ Cloudflare protection enabled
- [ ] Secrets Scanning: ✓ GitHub Actions check on every commit

## Deployment Stages

### Stage 1: Local Development

```bash
# 1. Clone and install
git clone https://github.com/tcn/niso.git
cd niso
npm install && npm install --prefix backend

# 2. Setup local database
docker run -d --name niso-db \
  -e POSTGRES_PASSWORD=dev_pw \
  -e POSTGRES_DB=niso \
  -p 5432:5432 \
  postgres:14

# 3. Initialize database
cd backend
npx prisma generate
npx prisma db push
npx prisma db seed

# 4. Start services
npm run dev           # Frontend: http://localhost:3000
npm run dev --prefix backend  # Backend: http://localhost:3001
```

### Stage 2: Staging Deployment (AWS)

#### 2.1 RDS PostgreSQL Setup

```bash
# Create RDS instance via AWS Console or CLI
aws rds create-db-instance \
  --db-instance-identifier niso-staging \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password $(openssl rand -base64 32) \
  --allocated-storage 100 \
  --storage-type gp3 \
  --backup-retention-period 7 \
  --enable-cloudwatch-logs-exports postgresql \
  --publicly-accessible false

# Store password in Secrets Manager
aws secretsmanager create-secret \
  --name niso/staging/db-password \
  --secret-string "$(openssl rand -base64 32)"
```

#### 2.2 Backend Deployment (ECS)

```yaml
# backend/docker/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY prisma ./prisma
RUN npx prisma generate

COPY src ./src
COPY tsconfig.json ./

RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

```bash
# Build and push to ECR
aws ecr create-repository --repository-name niso-backend

docker build -t niso-backend:staging -f backend/docker/Dockerfile .

aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker tag niso-backend:staging 123456789.dkr.ecr.us-east-1.amazonaws.com/niso-backend:staging
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/niso-backend:staging
```

#### 2.3 Frontend Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Login and deploy
vercel login
vercel --prod

# Environment variables via Vercel dashboard:
REACT_APP_API_URL=https://api-staging.niso.tcn.ng
REACT_APP_WS_URL=wss://ws-staging.niso.tcn.ng
```

#### 2.4 Environment Variables (Staging)

```bash
# Create .env.staging for backend
DATABASE_URL="postgresql://admin:PASSWORD@niso-staging.xxx.us-east-1.rds.amazonaws.com:5432/niso"
JWT_SECRET="$(openssl rand -base64 32)"
NODE_ENV="staging"
PORT=3000
LOG_LEVEL="info"
REDIS_URL="redis://staging-redis.xxx.cache.amazonaws.com:6379"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="niso-staging-uploads"
```

### Stage 3: Production Deployment

#### 3.1 Production RDS

```bash
aws rds create-db-instance \
  --db-instance-identifier niso-production \
  --db-instance-class db.t3.medium \
  --allocated-storage 500 \
  --storage-type gp3 \
  --backup-retention-period 30 \
  --multi-az \
  --enable-cloudwatch-logs-exports postgresql \
  --publicly-accessible false \
  --enable-iam-database-authentication
```

#### 3.2 Production Backend (Multi-region)

```bash
# Deploy to 2+ regions for HA
aws ecs create-service \
  --cluster niso-prod \
  --service-name niso-backend \
  --task-definition niso-backend:1 \
  --desired-count 3 \
  --load-balancers targetGroupArn=arn:...,containerName=niso-backend,containerPort=3000 \
  --auto-scaling-group-name niso-backend-asg
```

#### 3.3 Production Frontend (CDN)

```bash
# CloudFlare Workers for edge caching
wrangler publish

# Purge cache on deployment
curl -X POST https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache \
  -H "Authorization: Bearer TOKEN" \
  -d '{"files": ["https://app.niso.tcn.ng/"]}'
```

## Database Migrations

### Development Workflow

```bash
# 1. Create schema change
# Edit: prisma/schema.prisma

# 2. Generate migration
npx prisma migrate dev --name add_new_field

# 3. Review generated SQL
cat prisma/migrations/001_add_new_field/migration.sql

# 4. Test migration
npm run test:migrations

# 5. Commit to git
git add prisma/ && git commit -m "feat: add new_field to Reading model"
```

### Production Migration Strategy

```bash
# Blue-Green Deployment for zero-downtime
# 1. Create "niso-prod-blue" RDS snapshot
# 2. Restore to "niso-prod-green"
# 3. Run migrations on green
# 4. Test green thoroughly
# 5. Switch load balancer to green
# 6. Keep blue as rollback point

# Example script:
#!/bin/bash
RDS_ID="niso-production"
TIMESTAMP=$(date +%s)

# Take snapshot
aws rds create-db-snapshot \
  --db-instance-identifier $RDS_ID \
  --db-snapshot-identifier $RDS_ID-pre-migration-$TIMESTAMP

# Restore to temporary instance
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier $RDS_ID-temp \
  --db-snapshot-identifier $RDS_ID-pre-migration-$TIMESTAMP

# Wait for restore
aws rds wait db-instance-available \
  --db-instance-identifier $RDS_ID-temp

# Run migrations
DATABASE_URL="postgresql://..." npx prisma migrate deploy

# Validate
npm run test:integration

# If successful, update RDS endpoint in load balancer
# If failed, rollback: restore original snapshot
```

## Monitoring & Alerting

### Application Metrics

```bash
# DataDog agent configuration
datadog:
  logs_enabled: true
  apm_enabled: true
  process_config:
    enabled: true

# Key metrics to track:
# - API response time (p50, p95, p99)
# - Database query time
# - Error rate (4xx, 5xx)
# - Cache hit ratio
# - Active connections
```

### Health Checks

```typescript
// src/routes/health.ts
router.get('/health', async (req, res) => {
  try {
    // Database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Cache connectivity
    const pong = await redis.ping();
    
    // External dependencies
    const s3Health = await checkS3();

    res.json({
      status: 'healthy',
      timestamp: new Date(),
      checks: {
        database: 'ok',
        cache: pong === 'PONG' ? 'ok' : 'failing',
        s3: s3Health ? 'ok' : 'failing'
      }
    });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: error.message });
  }
});
```

### Alerting Rules

```yaml
# AlertManager rules
groups:
  - name: niso-critical
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate on {{ $labels.instance }}"
          action: "Check backend logs and database status"

      - alert: DatabaseConnectionPoolExhausted
        expr: pg_stat_activity_count > 90
        annotations:
          summary: "Database connection pool nearly full"
          action: "Scale backend horizontally or investigate slow queries"

      - alert: DiskSpaceRunningLow
        expr: node_filesystem_avail_percent < 10
        for: 10m
        annotations:
          action: "Increase RDS storage allocation"
```

### Log Aggregation

```bash
# ELK Stack example (or CloudWatch Logs)
# Backend sends structured logs:
logger.info('reading_created', {
  userId: user.id,
  readingId: reading.id,
  equipmentId: reading.equipmentId,
  timestamp: new Date().toISOString()
});

# Query logs:
GET /niso-*/_search
{
  "query": {
    "bool": {
      "must": [
        { "term": { "level": "error" } },
        { "range": { "timestamp": { "gte": "now-1h" } } }
      ]
    }
  }
}
```

## Backup & Disaster Recovery

### Automated Backups

```bash
# RDS automated backups (7-30 days retention)
aws rds modify-db-instance \
  --db-instance-identifier niso-production \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"

# Cross-region backup replication
aws rds create-db-instance-read-replica \
  --db-instance-identifier niso-production-replica \
  --source-db-instance-identifier arn:aws:rds:us-east-1:123456789:db:niso-production \
  --source-region us-east-1 \
  --db-instance-class db.t3.medium
```

### Point-in-Time Recovery

```bash
# Restore to specific point in time
aws rds restore-db-instance-to-point-in-time \
  --source-db-instance-identifier niso-production \
  --target-db-instance-identifier niso-production-restored \
  --restore-time 2024-01-15T14:30:00Z

# Test recovery
npm run test:integration -- --db-url "postgresql://... niso-production-restored"
```

### S3 Uploads Backup

```bash
# Enable versioning + lifecycle policies on S3 bucket
aws s3api put-bucket-versioning \
  --bucket niso-production-uploads \
  --versioning-configuration Status=Enabled

# Archive old versions to Glacier after 90 days
aws s3api put-bucket-lifecycle-configuration \
  --bucket niso-production-uploads \
  --lifecycle-configuration '{
    "Rules": [{
      "ID": "ArchiveOldVersions",
      "Filter": {"Prefix": ""},
      "NoncurrentVersionTransitions": [{
        "NoncurrentDays": 90,
        "StorageClass": "GLACIER"
      }]
    }]
  }'
```

## Scaling Strategy

### Horizontal Scaling

```bash
# Backend auto-scaling (ECS)
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/niso-prod/niso-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 3 \
  --max-capacity 20

aws application-autoscaling put-scaling-policy \
  --policy-name niso-backend-scaling \
  --service-namespace ecs \
  --resource-id service/niso-prod/niso-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration '{
    "TargetValue": 70.0,
    "PredefinedMetricSpecification": {
      "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
    }
  }'
```

### Vertical Scaling

```bash
# RDS storage scaling (automatic, or manual)
aws rds modify-db-instance \
  --db-instance-identifier niso-production \
  --allocated-storage 1000 \
  --apply-immediately
```

## Rollback Procedures

### Quick Rollback (Backend)

```bash
# If new backend version causes issues:
# 1. Revert ECS task definition to previous version
aws ecs update-service \
  --cluster niso-prod \
  --service niso-backend \
  --task-definition niso-backend:PREVIOUS_VERSION

# 2. Verify rollback
curl https://api.niso.tcn.ng/health
```

### Database Rollback

```bash
# If migration caused data corruption:
# 1. Stop all writes
# 2. Restore from pre-migration snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier niso-production-temp \
  --db-snapshot-identifier niso-production-pre-migration-TIMESTAMP

# 3. Validate data integrity
npm run test:data-integrity -- --db-url "postgresql://..."

# 4. Switch traffic back
# Update load balancer endpoint
```

## Compliance & Audit

### Audit Trail

Every action logged to AuditLog table:
- User ID, action, resource type, timestamp
- IP address, user agent
- Before/after values for mutations

```bash
# Query audit logs via API
GET /api/admin/audit-logs?action=delete&dateRange=2024-01-01,2024-01-31

# Export to CSV for compliance reports
POST /api/reports/generate?type=audit
```

### Data Retention Policy

```typescript
// Automated cleanup scheduled weekly
async function purgeOldData() {
  // Delete readings sealed > 2 years ago
  await prisma.reading.deleteMany({
    where: {
      sealedAt: {
        lt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000)
      }
    }
  });
}
```

### GDPR Compliance

```bash
# Right to be forgotten: delete user data
DELETE /api/admin/users/:userId/gdpr-delete

# Right to access: export user data
POST /api/admin/users/:userId/gdpr-export
```

## Incident Response

### Incident Severity Levels

| Level | Response Time | Impact | Example |
|-------|---------------|--------|---------|
| P1 | 15 min | Total system outage | Database unreachable |
| P2 | 30 min | Core feature unavailable | Reading input broken |
| P3 | 2 hours | Minor feature broken | Report export slow |
| P4 | 24 hours | Cosmetic/documentation | Typo in UI |

### Incident Playbook

```markdown
## P1: Database Connection Lost

1. **Detect** (CloudWatch alarm)
2. **Alert** (PagerDuty to on-call engineer)
3. **Assess** (Check RDS status, network connectivity)
   - Is RDS instance up? `aws rds describe-db-instances`
   - Are security groups allowing traffic? `aws ec2 describe-security-groups`
   - Is connection pool exhausted? Check CloudWatch metrics
4. **Mitigation**
   - Option A: Failover to read replica
   - Option B: Restart RDS instance (if safe)
   - Option C: Restore from snapshot to new instance
5. **Recovery** (Validate data, resume writes)
6. **Communication** (Notify stakeholders via Slack/email)
7. **Postmortem** (Schedule within 24h, document root cause)
```

## Performance Tuning

### Database Query Optimization

```sql
-- Identify slow queries
SELECT query, calls, mean_time, max_time 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Add missing indexes
CREATE INDEX idx_reading_sealed ON reading(sealed_at) WHERE sealed_at IS NOT NULL;

-- Analyze query plan
EXPLAIN ANALYZE
SELECT * FROM reading 
WHERE equipment_id = $1 AND date >= $2 AND sealed_at IS NULL;
```

### Redis Caching Strategy

```typescript
// Cache frequently-accessed readings
const cacheKey = `reading:${equipmentId}:${date}`;

// TTL: 1 hour
await redis.setex(cacheKey, 3600, JSON.stringify(reading));

// Invalidate on update
await redis.del(cacheKey);
```

### Frontend Performance

```bash
# Bundle analysis
npm run build:analyze

# Lighthouse report
npx lighthouse https://app.niso.tcn.ng --view

# Expected targets:
# - Largest Contentful Paint (LCP): < 2.5s
# - First Input Delay (FID): < 100ms
# - Cumulative Layout Shift (CLS): < 0.1
```

## Post-Deployment Validation

```bash
#!/bin/bash
echo "Running post-deployment validation..."

# 1. Health check
curl -f https://api.niso.tcn.ng/health || exit 1

# 2. Database connectivity
npm run test:db-connection || exit 1

# 3. Sample data reads
npm run test:sample-reads || exit 1

# 4. Authentication flow
npm run test:auth-flow || exit 1

# 5. Critical business logic
npm run test:business-logic || exit 1

# 6. Performance benchmark
npm run test:performance || exit 1

echo "✓ All validation checks passed!"
```

## Runbook Example: Scaling for Peak Load

**Scenario**: Traffic spike expected on Monday (forecasting deadline)

```bash
# 1. Pre-scale (Friday)
aws ecs update-service \
  --cluster niso-prod \
  --service niso-backend \
  --desired-count 10  # From 3

# 2. Monitor during spike (Monday)
watch -n 5 'aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=niso-backend \
  --start-time $(date -u -d "1 hour ago" +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Average'

# 3. Post-event scale-down (Tuesday)
aws ecs update-service \
  --cluster niso-prod \
  --service niso-backend \
  --desired-count 3

# 4. Document learnings
# - Did auto-scaling trigger correctly?
# - What was peak CPU/memory?
# - Any errors during spike?
# - Need to adjust thresholds?
```

---

**Next Steps**:
1. Set up monitoring dashboard in DataDog / CloudWatch
2. Configure alert notifications (PagerDuty / Slack)
3. Create incident response playbooks for common scenarios
4. Schedule quarterly disaster recovery drills
5. Document runbooks for on-call engineers
