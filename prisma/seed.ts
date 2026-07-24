import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";

const adapter = new PrismaBetterSqlite3({ url: "dev.db" });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding EduPulse database...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.document.deleteMany();
  await prisma.subTask.deleteMany();
  await prisma.task.deleteMany();
  await prisma.userClass.deleteMany();
  await prisma.class.deleteMany();
  await prisma.course.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("password123", 10);

  // 1. Create Users
  const adminLecturer = await prisma.user.create({
    data: {
      username: "wildan_dosen",
      email: "wildan@edupulse.ac.id",
      password: hashedPassword,
      name: "Wildan Budiawan Z, S.T., M.Kom.",
      isVerified: true,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      username: "afdhal_jihadi",
      email: "afdhal@student.edupulse.ac.id",
      password: hashedPassword,
      name: "Afdhal Jihadi",
      nim: "1247050111",
      isVerified: true,
    },
  });

  const student2 = await prisma.user.create({
    data: {
      username: "damar_alam",
      email: "damar@student.edupulse.ac.id",
      password: hashedPassword,
      name: "Damar Alam",
      nim: "1247050073",
      isVerified: true,
    },
  });

  console.log("✅ Users created");

  // 2. Create Course & Class
  const course = await prisma.course.create({
    data: {
      code: "INF204",
      name: "Basis Data & Perancangan Sistem",
      description: "Mata kuliah tentang pemodelan data relasional, SQL, dan rekayasa balik aplikasi.",
    },
  });

  const classRoom = await prisma.class.create({
    data: {
      courseId: course.id,
      name: "IF-4A (Tugas Kelompok)",
      year: "2025/2026",
      semester: "EVEN",
      classCode: "EDUP88",
      lecturerName: adminLecturer.name,
    },
  });

  console.log("✅ Course and Class created (Code: EDUP88)");

  // 3. UserClass Memberships
  await prisma.userClass.create({
    data: {
      userId: adminLecturer.id,
      classId: classRoom.id,
      role: "ADMIN",
    },
  });

  const student1Class = await prisma.userClass.create({
    data: {
      userId: student1.id,
      classId: classRoom.id,
      role: "MEMBER",
    },
  });

  const student2Class = await prisma.userClass.create({
    data: {
      userId: student2.id,
      classId: classRoom.id,
      role: "MEMBER",
    },
  });

  console.log("✅ Class memberships assigned");

  // 4. Create Task
  const task = await prisma.task.create({
    data: {
      classId: classRoom.id,
      createdById: adminLecturer.id,
      title: "Reverse Engineering Database Aplikasi Parkee",
      description: "Analisis alur transaksi Scan to Pay, buat PDM (Physical Data Model), DDL script, dan INSERT data dummy.",
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      status: "OPEN",
    },
  });

  // Subtasks
  await prisma.subTask.createMany({
    data: [
      { taskId: task.id, title: "Deskripsi Bisnis Proses & Data Flow", isCompleted: true },
      { taskId: task.id, title: "Physical Data Model (PDM) & ERD Diagram", isCompleted: true },
      { taskId: task.id, title: "Script DDL SQL & DML Dummy Data", isCompleted: true },
      { taskId: task.id, title: "Pengujian Query Rekapitulasi Transactions", isCompleted: false },
    ],
  });

  console.log("✅ Task & Subtasks created");

  // 5. Create Comments (Nested discussion thread)
  const parentComment = await prisma.comment.create({
    data: {
      taskId: task.id,
      userId: student1.id,
      userClassId: student1Class.id,
      content: "Pak, untuk bagian PDM apakah perlu mencantumkan data type VARCHAR beserta panjang karakternya?",
    },
  });

  await prisma.comment.create({
    data: {
      taskId: task.id,
      userId: adminLecturer.id,
      parentId: parentComment.id,
      content: "Ya betul, sebutkan tipe data presisi seperti VARCHAR(100), DECIMAL(10,2), dan TIMESTAMP beserta konstrain PK/FK.",
    },
  });

  await prisma.comment.create({
    data: {
      taskId: task.id,
      userId: student2.id,
      userClassId: student2Class.id,
      content: "Siap pak, laporan dan script SQL sudah kami susun di repositori.",
    },
  });

  console.log("✅ Discussion comments seeded");
  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
