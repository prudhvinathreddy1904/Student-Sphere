import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getCommentsByPostId, createComment, getPostById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/posts/[id]/comments">,
) {
  try {
    const { id } = await ctx.params;
    const comments = getCommentsByPostId(Number(id));
    return NextResponse.json({ comments });
  } catch (error) {
    console.error("Fetch comments error:", error);
    return NextResponse.json(
      { error: "Unable to fetch comments." },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/posts/[id]/comments">,
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to comment." },
        { status: 401 },
      );
    }

    const { id } = await ctx.params;
    const postId = Number(id);

    const post = getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const body = await request.json();
    const content = String(body?.content ?? "").trim();

    if (!content) {
      return NextResponse.json(
        { error: "Comment cannot be empty." },
        { status: 400 },
      );
    }

    if (content.length > 500) {
      return NextResponse.json(
        { error: "Comment must be 500 characters or fewer." },
        { status: 400 },
      );
    }

    const comment = createComment({ postId, userId: user.id, content });
    return NextResponse.json({ comment }, { status: 201 });
  } catch (error) {
    console.error("Create comment error:", error);
    return NextResponse.json(
      { error: "Unable to add comment." },
      { status: 500 },
    );
  }
}
