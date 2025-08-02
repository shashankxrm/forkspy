#!/usr/bin/env bash
# MongoDB initialization script for ForkSpy

echo "🚀 Initializing MongoDB for ForkSpy..."

# Switch to forkspy database
mongosh <<EOF
use forkspy

// Create collections with proper indexes
db.createCollection("users")
db.createCollection("repositories")

// Create indexes for users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "lastSignIn": 1 })

// Create indexes for repositories collection
db.repositories.createIndex({ "repoUrl": 1, "userEmail": 1 }, { unique: true })
db.repositories.createIndex({ "userEmail": 1 })
db.repositories.createIndex({ "createdAt": 1 })
db.repositories.createIndex({ "webhookId": 1 })

// Create a sample user for development (only if this is not production)
if (process.env.NODE_ENV !== 'production') {
  db.users.insertOne({
    email: "dev@forkspy.com",
    name: "Development User",
    image: "https://github.com/github.png",
    lastSignIn: new Date()
  })
  
  console.log("✅ Development user created")
}

console.log("✅ MongoDB initialization completed for ForkSpy")
EOF

echo "🎉 MongoDB setup complete!"
