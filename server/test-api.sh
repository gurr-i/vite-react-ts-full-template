#!/bin/bash

# Base URL for the API
BASE_URL="http://localhost:3000/api"

# Test user credentials
USERNAME="testuser"
PASSWORD="Test@123456"

# Colors for output
GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m" # No Color

echo "Starting API Tests..."

# Test 1: Register new user
echo -e "\n${GREEN}Testing User Registration${NC}"
curl -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"$PASSWORD\"
  }" \
  -c cookies.txt

# Test 2: Login with credentials
echo -e "\n${GREEN}Testing User Login${NC}"
curl -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"$PASSWORD\",
    \"rememberMe\": true
  }" \
  -c cookies.txt

# Test 3: Get current user (requires authentication)
echo -e "\n${GREEN}Testing Get Current User${NC}"
curl -X GET "$BASE_URL/user" \
  -b cookies.txt

# Test 4: Request password reset
echo -e "\n${GREEN}Testing Password Reset Request${NC}"
RESET_RESPONSE=$(curl -X POST "$BASE_URL/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\"
  }")

# Extract reset token from response
RESET_TOKEN=$(echo $RESET_RESPONSE | grep -o '"resetToken":"[^"]*"' | cut -d'"' -f4)

# Test 5: Reset password with token
echo -e "\n${GREEN}Testing Password Reset${NC}"
curl -X POST "$BASE_URL/reset-password" \
  -H "Content-Type: application/json" \
  -d "{
    \"token\": \"$RESET_TOKEN\",
    \"password\": \"NewTest@123456\"
  }"

# Test 6: Login with new password
echo -e "\n${GREEN}Testing Login with New Password${NC}"
curl -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"username\": \"$USERNAME\",
    \"password\": \"NewTest@123456\"
  }" \
  -c cookies.txt

# Test 7: Logout
echo -e "\n${GREEN}Testing Logout${NC}"
curl -X POST "$BASE_URL/logout" \
  -b cookies.txt

# Cleanup
rm -f cookies.txt

echo -e "\n${GREEN}API Tests Completed${NC}"