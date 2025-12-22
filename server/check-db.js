import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const passes = await prisma.gatepass.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: {
            id: true,
            status: true,
            qrCodeData: true,
            updatedAt: true
        }
    });
    console.log(JSON.stringify(passes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
