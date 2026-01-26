
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

async function main() {
  const prisma = new PrismaClient();
  try {
    const meetings = await prisma.meeting.findMany({
      take: 1
    });
    fs.writeFileSync('prisma_output.txt', 'Meetings found: ' + meetings.length);
  } catch (error: any) {
    fs.writeFileSync('prisma_error.txt', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
  } finally {
    await prisma.$disconnect();
  }
}

main();
