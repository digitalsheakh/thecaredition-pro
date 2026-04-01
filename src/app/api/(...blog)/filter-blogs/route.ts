import { NextRequest, NextResponse } from "next/server";
import { collections, dbConnect } from "@/lib/dbConnect";
import { authorizationCheck } from "@/lib/authorization";


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
    const { searchParams } = new URL(req.url);
    const searchTerm = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");


    const blogsCollection =await dbConnect(collections.blogs);


    // Build query
    const query: any = {};
  
  if (searchTerm) {
      // Check if text index exists
      const indexes = await blogsCollection.indexes();
      const hasTextIndex = indexes.some((index: any) => index.name === "booking_search_text");
      
      if (hasTextIndex) {
        query.$text = { $search: searchTerm };
      } else {
        // Fallback to regex if text index doesn't exist
        query.$or = [
          { title: { $regex: searchTerm, $options: "i" } },
          { createdAt: { $regex: searchTerm, $options: "i" } },
        ];
      }
    }

    // Get total count (optimized)
    const totalPromise = blogsCollection.countDocuments(query);

    // Get paginated results with services lookup
    const bookingsPromise = blogsCollection.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]).toArray();
    const [total, bookings] = await Promise.all([totalPromise, bookingsPromise]);

    return NextResponse.json({
      data: bookings,
      pagination: {
        page,
        limit,
        total : total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings data" },
      { status: 500 }
    );
  }
}

