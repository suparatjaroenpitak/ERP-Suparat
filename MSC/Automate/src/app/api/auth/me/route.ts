import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieHeader = request.headers.get("cookie");

    const user = getAuthenticatedUser(authHeader, cookieHeader);

    if (!user) {
      return NextResponse.json(
        {
          authenticated: false,
          user: null,
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        username: user.username,
      },
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
