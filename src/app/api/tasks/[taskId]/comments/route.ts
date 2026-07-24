import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks/[taskId]/comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;

    const comments = await prisma.comment.findMany({
      where: {
        taskId,
        parentId: null, // Only fetch root comments; replies are nested inside
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            nim: true,
            profilePicture: true,
          },
        },
        userClass: {
          select: {
            role: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                username: true,
                nim: true,
                profilePicture: true,
              },
            },
            userClass: {
              select: {
                role: true,
              },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch comments" },
      { status: 500 }
    );
  }
}

// POST /api/tasks/[taskId]/comments
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    const body = await request.json();
    const { userId, content, parentId } = body;

    if (!userId || !content || content.trim() === "") {
      return NextResponse.json(
        { success: false, error: "UserId and content are required" },
        { status: 400 }
      );
    }

    // Find task & user's class membership for role lookup
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { classId: true },
    });

    if (!task) {
      return NextResponse.json(
        { success: false, error: "Task not found" },
        { status: 404 }
      );
    }

    const userClass = await prisma.userClass.findUnique({
      where: {
        userId_classId: {
          userId,
          classId: task.classId,
        },
      },
    });

    const newComment = await prisma.comment.create({
      data: {
        taskId,
        userId,
        userClassId: userClass?.id ?? null,
        content: content.trim(),
        parentId: parentId || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            nim: true,
            profilePicture: true,
          },
        },
        userClass: {
          select: {
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: newComment }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create comment" },
      { status: 500 }
    );
  }
}
