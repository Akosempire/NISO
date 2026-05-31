#!/bin/bash

# NISO Supabase Setup Script
# Creates all tables, indexes, RLS policies, and seed data

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}NISO Supabase Setup${NC}"
echo "===================="
echo ""

# Check if SUPABASE_URL and SUPABASE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
  echo -e "${YELLOW}Please set SUPABASE_URL and SUPABASE_KEY environment variables${NC}"
  echo "Example:"
  echo "  export SUPABASE_URL='https://your-project.supabase.co'"
  echo "  export SUPABASE_KEY='your-anon-key'"
  exit 1
fi

echo -e "${GREEN}✓ Supabase credentials found${NC}"
echo ""

# Option 1: Use Supabase CLI (if installed)
if command -v supabase &> /dev/null; then
  echo -e "${YELLOW}Using Supabase CLI...${NC}"
  supabase db push
  echo -e "${GREEN}✓ Schema applied${NC}"
else
  echo -e "${YELLOW}Supabase CLI not found. Using psql...${NC}"
  
  # Extract connection string from SUPABASE_URL
  # Format: https://project-ref.supabase.co
  PROJECT_REF=$(echo $SUPABASE_URL | sed 's|https://\(.*\).supabase.co|\1|')
  
  # Read password from input or environment
  read -sp "Supabase Password (or set SUPABASE_PASSWORD): " DB_PASSWORD
  [ -z "$DB_PASSWORD" ] && DB_PASSWORD=$SUPABASE_PASSWORD
  
  # Connect to database
  psql "postgresql://postgres:$DB_PASSWORD@$PROJECT_REF.postgres.supabase.co:5432/postgres" -f ./schema.sql
  
  echo -e "${GREEN}✓ Schema applied${NC}"
fi

echo ""
echo -e "${GREEN}Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Create users in Supabase Auth dashboard"
echo "2. Insert user records using the INSERT statement in schema.sql"
echo "3. Update your frontend .env with SUPABASE_URL and SUPABASE_ANON_KEY"
