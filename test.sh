#!/bin/bash
set -euo pipefail

echo "🚀 Rebuilding system..."
docker compose down -v
docker compose up -d --build

echo "⏳ Waiting for services to start..."
sleep 5

echo "🧪 Gateway health..."
curl -fsS http://localhost:8080/api/health
echo ""
echo ""

echo "🧪 Creating user..."
curl -fsS -X POST http://localhost:8080/api/users/ \
     -H "Content-Type: application/json" \
     -d '{"name": "Bob", "email": "bob@example.com", "grade_level": "10"}'
echo ""
echo ""

echo "🧪 Verifying user..."
curl -fsS http://localhost:8080/api/users/1
echo ""
echo ""

echo "🧪 Creating homework..."
curl -fsS -X POST http://localhost:8080/api/homework/ \
     -H "Content-Type: application/json" \
     -d '{"user_id": 1, "assignment_name": "Science Project", "course": "Biology", "due_date": "2025-03-12T15:00:00"}'
echo ""
echo ""

echo "🧪 Listing homework for user 1..."
curl -fsS http://localhost:8080/api/homework/users/1/homework
echo ""
echo ""

echo "🧪 Checking notification..."
curl -fsS http://localhost:8080/api/notifications/1
echo ""
echo ""

echo "🧪 Checking health of all services..."
echo "API Gateway:"
curl -fsS http://localhost:8080/api/health
echo ""

echo "User-service:"
curl -fsS http://localhost:8080/api/users/health
echo ""

echo "HW-service:"
curl -fsS http://localhost:8080/api/homework/health
echo ""

echo "Notification-service:"
curl -fsS http://localhost:8080/api/notifications/health
echo ""

echo "✅ Smoke test complete."
