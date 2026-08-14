import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Zod schema for request validation
const CreateCommentSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  content: z.string().min(1, "Comment content is required").trim(),
  parentId: z.string().nullable().optional(),
});

// Reusable user select for Prisma queries
const UserSelect = {
  id: true,
  name: true,
  username: true,
  nim: true,
  profilePicture: true,
};

// Reusable userClass select for Prisma queries
const UserClassSelect = {
  role: true,
};

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
        user: { select: UserSelect },
        userClass: { select: UserClassSelect },
        replies: {
          include: {
            user: { select: UserSelect },
            userClass: { select: UserClassSelect },
          },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ success: true, data: comments });
  } catch (error: unknown) {
    console.error("GET /api/tasks/[taskId]/comments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch comments. Please try again later." },
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
    
    // Validate request body using Zod
    const result = CreateCommentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId, content, parentId } = result.data;

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
        content,
        parentId: parentId || null,
      },
      include: {
        user: { select: UserSelect },
        userClass: { select: UserClassSelect },
      },
    });

    return NextResponse.json({ success: true, data: newComment }, { status: 201 });
  } catch (error: unknown) {
    console.error("POST /api/tasks/[taskId]/comments error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create comment. Please try again later." },
      { status: 500 }
    );
  }
}
