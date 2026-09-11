import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getPostById, updatePost, deletePostById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/posts/[id]">,
) {
  try {
    const { id } = await ctx.params;
    const user = await getCurrentUser();
    const post = getPostById(Number(id), user?.id);

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Fetch post error:", error);
    return NextResponse.json(
      { error: "Unable to fetch post." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: RouteContext<"/api/posts/[id]">,
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await ctx.params;
    const post = getPostById(Number(id));

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (post.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only edit your own posts." },
        { status: 403 },
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

    const updated = updatePost(Number(id), { title, category, description, tags });
    return NextResponse.json({ post: updated });
  } catch (error) {
    console.error("Update post error:", error);
    return NextResponse.json(
      { error: "Unable to update post." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/posts/[id]">,
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { id } = await ctx.params;
    const post = getPostById(Number(id));

    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    if (post.userId !== user.id) {
      return NextResponse.json(
        { error: "You can only delete your own posts." },
        { status: 403 },
      );
    }

    deletePostById(Number(id));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete post error:", error);
    return NextResponse.json(
      { error: "Unable to delete post." },
      { status: 500 },
    );
  }
}
