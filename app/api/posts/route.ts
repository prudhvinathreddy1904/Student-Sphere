import { NextResponse } from "next/server";
import { createPost, getAllPosts } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const sort = (searchParams.get("sort") as "newest" | "votes") || "newest";

    const user = await getCurrentUser();

    const posts = getAllPosts({
      search,
      category,
      sort,
      currentUserId: user?.id,
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("Fetch posts error:", error);
    return NextResponse.json(
      { error: "Unable to fetch posts right now." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to create a post." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const title = String(body?.title ?? "").trim();
    const category = String(body?.category ?? "").trim();
    const description = String(body?.description ?? "").trim();
    const tags = Array.isArray(body?.tags)
      ? body.tags.map((tag: unknown) => String(tag).trim()).filter(Boolean)
      : [];

    if (!title || !category || !description) {
      return NextResponse.json(
        { error: "Please complete all required fields." },
        { status: 400 },
      );
    }

    if (title.length > 120) {
      return NextResponse.json(
        { error: "Title must be 120 characters or fewer." },
        { status: 400 },
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { error: "Description must be 2000 characters or fewer." },
        { status: 400 },
      );
    }

    const post = createPost({
      title,
      category,
      description,
      creator: user.displayName,
      email: user.email,
      tags,
      userId: user.id,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Create post error:", error);
    return NextResponse.json(
      { error: "Unable to create post at the moment." },
      { status: 500 },
    );
  }
}
