import { PrismaClient } from '@prisma/client';
import { hashPassword } from './src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
    const email = 'subrajit09@gmail.com';
    const password = 'subra09';

    const userExists = await prisma.user.findUnique({ where: { email } });

    if (userExists) {
        console.log('Admin user already exists.');
        return;
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            fullName: 'System Admin',
            role: 'ADMIN',
            hostel: null,
            rollNo: null,
            parentContact: null,
        },
    });

    console.log('Admin user created successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
