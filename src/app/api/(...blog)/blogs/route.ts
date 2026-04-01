

import { authorizationCheck } from "@/lib/authorization";
import { collections, dbConnect } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";

// Database connection will be established in each function

export async function POST(req :NextRequest) {
  const referer = req.headers.get('referer') || '';
  const refererPath = new URL(referer).pathname;
  
  // Pass referer path to authorization check
  const authResult = await authorizationCheck(refererPath);
  
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }
  try {
    const blogsCollection = await dbConnect(collections.blogs);
    const formInfo = await req.json();
    const result = await blogsCollection.insertOne({ ...formInfo, createdAt : new Date() });
    return NextResponse.json(result, { status: 201 }); 
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const referer = req.headers.get('referer') || '';
  const refererPath = new URL(referer).pathname;
  
  // Pass referer path to authorization check
  const authResult = await authorizationCheck(refererPath);
  
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const blogsCollection = await dbConnect(collections.blogs);
    const result = await blogsCollection.find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
  }
}
