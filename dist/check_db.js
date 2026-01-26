"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
async function main() {
    const prisma = new client_1.PrismaClient();
    try {
        const result = await prisma.$queryRaw `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Meeting';
    `;
        console.log('Columns in Meeting table:');
        console.log(JSON.stringify(result, null, 2));
    }
    catch (e) {
        console.error(e);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=check_db.js.map