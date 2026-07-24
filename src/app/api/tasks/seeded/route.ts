import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/tasks/seeded
export async function GET() {
  try {
    const classRoom = await prisma.class.findFirst({
      include: {
        course: true,
        tasks: {
          include: {
            subTasks: true,
            _count: { select: { comments: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, data: classRoom });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch seeded data" },
      { status: 500 }
    );
  }
}
