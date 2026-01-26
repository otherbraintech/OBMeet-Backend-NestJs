
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    // This is how Prisma sees the model
    const dmmf = (prisma as any)._dmmf;
    const meetingModel = dmmf.datamodel.models.find((m: any) => m.name === 'Meeting');
    console.log('Prisma Model Fields:');
    console.log(meetingModel.fields.map((f: any) => ({ name: f.name, dbName: f.dbName })));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
