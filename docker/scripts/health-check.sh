#!/usr/bin/env bash
# Health check script for ForkSpy application

set -e

# Health check function for MongoDB
check_mongodb() {
    echo "🔍 Checking MongoDB health..."
    
    if mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        echo "✅ MongoDB is healthy"
        return 0
    else
        echo "❌ MongoDB is not responding"
        return 1
    fi
}

# Health check function for ForkSpy application
check_app() {
    echo "🔍 Checking ForkSpy application health..."
    
    # Check if the application is responding
    if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
        echo "✅ ForkSpy application is healthy"
        return 0
    else
        echo "❌ ForkSpy application is not responding"
        return 1
    fi
}

# Check if Next.js build is successful
check_build() {
    echo "🔍 Checking if Next.js build exists..."
    
    if [ -d "/app/.next" ]; then
        echo "✅ Next.js build found"
        return 0
    else
        echo "❌ Next.js build not found"
        return 1
    fi
}

# Main health check logic
main() {
    echo "🚀 Starting health check for ForkSpy..."
    
    case "${1:-app}" in
        "mongodb")
            check_mongodb
            ;;
        "app")
            check_app
            ;;
        "build")
            check_build
            ;;
        "all")
            check_mongodb && check_app
            ;;
        *)
            echo "Usage: $0 [mongodb|app|build|all]"
            echo "Default: app"
            exit 1
            ;;
    esac
    
    if [ $? -eq 0 ]; then
        echo "🎉 Health check passed!"
        exit 0
    else
        echo "💥 Health check failed!"
        exit 1
    fi
}

main "$@"
