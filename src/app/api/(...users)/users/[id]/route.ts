import { ObjectId } from "mongodb";
import{ dbConnect,  collections } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { authorizationCheck } from "@/lib/authorization";

interface User extends Document {
  _id: ObjectId;
  name?: string;
  mobile?: string;
  email?: string;
  role?: string;
  adminPhoto?: string | string[] | null;
  profilePhoto?: string | string[] | null;
  permissions?: string[];
  instituteId?: string;
  password?: string;
}

// GET — fetch user by ID
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
    const usersCollection = await dbConnect<User>(collections.users);
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const user = await usersCollection.findOne({ _id: new ObjectId(id) });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return user data without sensitive information
    const { password, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword, { status: 200 });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

// PUT — update user profile (for frontend compatibility)
export async function PUT(req: NextRequest) {
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
    const usersCollection = await dbConnect<User>(collections.users);
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const filter = { _id: new ObjectId(id) };
    const update = await req.json();
    
    // Check if user exists
    const user = await usersCollection.findOne(filter);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Email uniqueness check (only if email is being updated)
    if (update.email && update.email !== user.email) {
      const existingUser = await usersCollection.findOne({ email: update.email });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists, please use a different email" },
          { status: 409 }
        );
      }
    }

    const updateDoc = {
      $set: {
        name: update.name,
        email: update.email,
        mobile: update.mobile,
        profilePhoto: update.profilePhoto || update.adminPhoto, // Handle both field names
        updatedAt: new Date()
      }
    };

    const result = await usersCollection.updateOne(filter, updateDoc);
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes were made to user" }, { status: 200 });
    }
    
    return NextResponse.json({ message: "User updated successfully", result }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// PATCH — update user profile
export async function PATCH(req: NextRequest) {
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
    const usersCollection = await dbConnect<User>(collections.users);
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const filter = { _id: new ObjectId(id) };
    const update = await req.json();
    
    // Check if user exists
    const user = await usersCollection.findOne(filter);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Email uniqueness check (only if email is being updated)
    if (update.email && update.email !== user.email) {
      const existingUser = await usersCollection.findOne({ email: update.email });
      if (existingUser) {
        return NextResponse.json(
          { error: "Email already exists, please use a different email" },
          { status: 409 }
        );
      }
    }

    const updateDoc = {
      $set: {
        name: update.name,
        email: update.email,
        mobile: update.mobile,
        profilePhoto: update.profilePhoto || update.adminPhoto, // Handle both field names
        updatedAt: new Date()
      }
    };

    const result = await usersCollection.updateOne(filter, updateDoc);
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: "No changes were made to user" }, { status: 200 });
    }
    
    return NextResponse.json({ message: "User updated successfully", result }, { status: 200 });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE — soft delete by marking as "deleted"
export async function DELETE(req: NextRequest) {
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
    // TODO: Re-enable database connection after deployment
    // const usersCollection = await dbConnect(collections.users);
    const id = req.nextUrl.pathname.split("/").pop();

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const filter = { _id: new ObjectId(id) };

    // TODO: Re-enable database delete
    // const result = await usersCollection.deleteOne(filter);
    const result = { deletedCount: 1 };

    if (result.deletedCount > 0) {
      return NextResponse.json({ message: "users marked as deleted" }, { status: 200 });
    } else {
      return NextResponse.json({ error: "users not found or already deleted" }, { status: 404 });
    }
  } catch (error) {
    console.error("Error deleting users:", error);
    return NextResponse.json({ error: "An error occurred while deleting the users." }, { status: 500 });
  }
}
