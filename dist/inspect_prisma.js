"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        const dmmf = prisma._dmmf;
        const meetingModel = dmmf.datamodel.models.find((m) => m.name === 'Meeting');
        console.log('Prisma Model Fields:');
        console.log(meetingModel.fields.map((f) => ({ name: f.name, dbName: f.dbName })));
    }
    catch (err) {
        console.error(err);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=inspect_prisma.js.map