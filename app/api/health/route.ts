import { NextResponse } from "next/server";
import { MongoClient } from "mongodb";

// Health check endpoint for Docker containers
export async function GET() {
  try {
    // Check MongoDB connection
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      return NextResponse.json(
        { 
          status: "unhealthy", 
          error: "MONGO_URI not configured",
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }

    const client = new MongoClient(mongoUri);
    
    try {
      await client.connect();
      await client.db("admin").command({ ping: 1 });
      await client.close();
    } catch (error) {
      return NextResponse.json(
        { 
          status: "unhealthy", 
          error: "Database connection failed",
          details: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }, 
        { status: 500 }
      );
    }

    // If we get here, everything is healthy
    return NextResponse.json({
      status: "healthy",
      service: "forkspy",
      version: process.env.npm_package_version || "unknown",
      environment: process.env.NODE_ENV || "unknown",
      database: "connected",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return NextResponse.json(
      { 
        status: "unhealthy", 
        error: "Health check failed",
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}
