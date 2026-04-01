import { authorizationCheck } from "@/lib/authorization";
import { collections, dbConnect } from "@/lib/dbConnect";
import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

// Define interfaces for blog collections
interface Blog {
  _id: ObjectId;
  title: string;
  content: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaImageUrl?: string;
  createdAt: Date;
}


// GET — fetch blog by ID
export async function GET(req: NextRequest) {
  try {
    // Handle build-time execution
    if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI && !process.env.NEXT_PUBLIC_MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 503 });
    }

    const blogsCollection = await dbConnect(collections.blogs);
    const id = req.nextUrl.pathname.split("/").pop();
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog, { status: 200 });

  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" }, 
      { status: 500 }
    );
  }
}

// PATCH — update blog details
export async function PATCH(req: NextRequest) {
  try {
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
    const blogsCollection = await dbConnect(collections.blogs);
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const filter = { _id: new ObjectId(id) };
    const update = await req.json();
    const blog = await blogsCollection.findOne(filter);

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const updateDoc = {
      $set: {
          title: update.title,
          content: update.content,
          imageUrl: update.imageUrl,
          metaTitle: update.metaTitle,
          metaDescription: update.metaDescription,
          metaImageUrl: update.metaImageUrl,
          updatedAt: new Date()
      }
    };

    const result = await blogsCollection.updateOne(filter, updateDoc);
    return NextResponse.json({ message: "Blog updated successfully", ...result }, { status: 200 });
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }
}

// DELETE — delete blog
export async function DELETE(req: NextRequest) {
  try {
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
    const blogsCollection = await dbConnect(collections.blogs);
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const filter = { _id: new ObjectId(id) };
    const result = await blogsCollection.deleteOne(filter);

    if (result.deletedCount > 0) {
      return NextResponse.json({ message: "Blog deleted successfully", ...result}, { status: 200 });
    } else {
      return NextResponse.json({ error: "Blog not found or already deleted" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json({ error: "An error occurred while deleting the blog." }, { status: 500 });
  }
}
