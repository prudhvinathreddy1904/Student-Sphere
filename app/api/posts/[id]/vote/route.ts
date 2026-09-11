import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { toggleVote, getPostById } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  ctx: RouteContext<"/api/posts/[id]/vote">,
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "You must be logged in to vote." },
        { status: 401 },
      );
    }

    const { id } = await ctx.params;
    const postId = Number(id);

    const post = getPostById(postId);
    if (!post) {
      return NextResponse.json({ error: "Post not found." }, { status: 404 });
    }

    const result = toggleVote(user.id, postId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Vote error:", error);
    return NextResponse.json(
      { error: "Unable to vote right now." },
      { status: 500 },
    );
  }
}
