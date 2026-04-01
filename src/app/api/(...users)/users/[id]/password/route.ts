import { ObjectId } from "mongodb";
import { dbConnect, collections } from "@/lib/dbConnect";
import { NextRequest, NextResponse } from "next/server";
import { authorizationCheck } from "@/lib/authorization";

interface User extends Document {
  _id: ObjectId;
  name?: string;
  mobile?: string;
  email?: string;
  role?: string;
  adminPhoto?: string | string[] | null;
  permissions?: string[];
  instituteId?: string;
  password?: string;
  oldPasswords?: string[];
}

// PUT — update user password
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
    const id = req.nextUrl.pathname.split("/").slice(-2)[0]; // Get [id] from /api/users/[id]/password

    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid ID format" }, { status: 400 });
    }

    const filter = { _id: new ObjectId(id) };
    const update = await req.json();

    // Validate required fields
    if (!update.currentPassword || !update.newPassword) {
      return NextResponse.json({ 
        error: "Current password and new password are required" 
      }, { status: 400 });
    }

    // Get user from database
    const user = await usersCollection.findOne(filter);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    if (update.currentPassword !== user.password) {
      return NextResponse.json({ 
        error: "Current password doesn't match" 
      }, { status: 400 });
    }

    // Prevent using the same password
    if (update.currentPassword === update.newPassword) {
      return NextResponse.json({ 
        error: "New password must be different from current password" 
      }, { status: 400 });
    }

    // Update password history
    const oldPasswords = [...(user.oldPasswords || [])];
    oldPasswords.push(update.currentPassword);

    const updateDoc = {
      $set: {
        password: update.newPassword,
        oldPasswords: oldPasswords,
        updatedAt: new Date()
      }
    };

    const result = await usersCollection.updateOne(filter, updateDoc);
    
    if (result.modifiedCount === 0) {
      return NextResponse.json({ 
        error: "Failed to update password" 
      }, { status: 500 });
    }
 
    return NextResponse.json({ 
      message: "Password updated successfully", 
      result 
    }, { status: 200 });
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json({ 
      error: "Failed to update password" 
    }, { status: 500 });
  }
}
