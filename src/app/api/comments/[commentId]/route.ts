import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// DELETE /api/comments/[commentId]?userId=xyz
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ commentId: string }> }
) {
  try {
    const { commentId } = await params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { success: false, error: "userId parameter is required for authorization" },
        { status: 400 }
      );
    }

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        task: {
          select: { classId: true },
        },
      },
    });

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "Comment not found" },
        { status: 404 }
      );
    }

    // Check user's role in the class
    const userClass = await prisma.userClass.findUnique({
      where: {
        userId_classId: {
          userId,
          classId: comment.task.classId,
        },
      },
    });

    const isAdmin = userClass?.role === "ADMIN";
    const isAuthor = comment.userId === userId;

    if (!isAdmin && !isAuthor) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to delete this comment" },
        { status: 403 }
      );
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });

    return NextResponse.json({ success: true, message: "Comment deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete comment" },
      { status: 500 }
    );
  }
}
