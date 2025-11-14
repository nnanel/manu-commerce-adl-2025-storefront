#!/bin/bash

###############################################################################
# Pre-Deployment Test Script for Product Ratings
# 
# This script runs all necessary checks before deploying the storefront:
# 1. Linting (JavaScript and CSS)
# 2. Product Ratings Test Suite
# 3. API Health Check
# 
# Usage:
#   ./scripts/pre-deploy.sh
#
# Exit codes:
#   0 - All checks passed
#   1 - Linting failed
#   2 - Tests failed
#   3 - API health check failed
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RATINGS_API_URL="${RATINGS_API_URL:-https://1899289-606byzantiumcuckoo-stage.adobeioruntime.net/api/v1/web/ratings-api/get-ratings}"
TEST_SKU="MH01"

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║         Product Ratings Pre-Deployment Checks                 ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

###############################################################################
# 1. Linting
###############################################################################

echo -e "${BLUE}[1/3] Running linting checks...${NC}"
echo ""

if npm run lint; then
    echo ""
    echo -e "${GREEN}✅ Linting passed!${NC}"
else
    echo ""
    echo -e "${RED}❌ Linting failed!${NC}"
    echo "Please fix linting errors before deploying."
    exit 1
fi

echo ""

###############################################################################
# 2. API Health Check
###############################################################################

echo -e "${BLUE}[2/3] Checking Ratings API health...${NC}"
echo ""

# Check if API is accessible
echo "Testing API endpoint: ${RATINGS_API_URL}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${RATINGS_API_URL}?sku=${TEST_SKU}")

if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✅ API is healthy (HTTP ${HTTP_STATUS})${NC}"
    
    # Validate response structure
    RESPONSE=$(curl -s "${RATINGS_API_URL}?sku=${TEST_SKU}")
    
    if echo "$RESPONSE" | grep -q "\"sku\"" && \
       echo "$RESPONSE" | grep -q "\"averageRating\"" && \
       echo "$RESPONSE" | grep -q "\"totalCount\""; then
        echo -e "${GREEN}✅ API response structure is valid${NC}"
    else
        echo -e "${RED}❌ API response structure is invalid${NC}"
        echo "Response: $RESPONSE"
        exit 3
    fi
else
    echo -e "${RED}❌ API health check failed (HTTP ${HTTP_STATUS})${NC}"
    echo "Please ensure the Ratings API is deployed and accessible."
    exit 3
fi

echo ""

###############################################################################
# 3. Run Test Suite
###############################################################################

echo -e "${BLUE}[3/3] Running Product Ratings test suite...${NC}"
echo ""

# Set environment variables for tests
export TEST_BASE_URL="${TEST_BASE_URL:-http://localhost:3000}"
export RATINGS_API_URL="${RATINGS_API_URL}"

# Run tests
if npm run test:ratings; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
else
    echo ""
    echo -e "${RED}❌ Tests failed!${NC}"
    echo ""
    echo "View detailed test report:"
    echo "  npm run test:report"
    echo ""
    exit 2
fi

echo ""

###############################################################################
# Summary
###############################################################################

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                                                                ║"
echo "║                  ✅ All Checks Passed!                         ║"
echo "║                                                                ║"
echo "║         The application is ready for deployment                ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

exit 0

