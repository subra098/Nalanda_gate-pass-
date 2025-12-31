import prisma from "../config/db.js";

export const scanQrCode = async (req, res) => {
    try {
        const { gatepassId, type } = req.body;
        const securityGuardId = req.user.id;

        // Find pass in any of the three tables
        let gatepass;
        let table;

        gatepass = await prisma.chandakaPass.findUnique({ where: { id: gatepassId } });
        if (gatepass) table = 'chandakaPass';

        if (!gatepass) {
            gatepass = await prisma.bhubaneswarPass.findUnique({ where: { id: gatepassId } });
            if (gatepass) table = 'bhubaneswarPass';
        }

        if (!gatepass) {
            gatepass = await prisma.homePass.findUnique({ where: { id: gatepassId } });
            if (gatepass) table = 'homePass';
        }

        if (!gatepass) {
            return res.status(404).json({ message: "Gatepass not found" });
        }

        // Validate Status
        if (type === "EXIT" && gatepass.status !== "SUPERINTENDENT_APPROVED") {
            return res.status(400).json({ message: "Pass not approved for exit" });
        }

        const newStatus = type === "EXIT" ? "EXITED" : "ENTERED";
        const scanLogData = {
            securityGuardId,
            action: type,
        };

        if (table === 'chandakaPass') scanLogData.chandakaPassId = gatepassId;
        else if (table === 'bhubaneswarPass') scanLogData.bhubaneswarPassId = gatepassId;
        else if (table === 'homePass') scanLogData.homePassId = gatepassId;

        await prisma.$transaction([
            prisma[table].update({
                where: { id: gatepassId },
                data: { status: newStatus }
            }),
            prisma.scanLog.create({
                data: scanLogData
            })
        ]);

        res.json({ message: `Scan successful: ${newStatus}` });
    } catch (error) {
        console.error("Scan QR Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getScanLogs = async (req, res) => {
    try {
        const logs = await prisma.scanLog.findMany({
            include: {
                chandakaPass: { include: { student: { select: { fullName: true, rollNo: true, hostel: true } } } },
                bhubaneswarPass: { include: { student: { select: { fullName: true, rollNo: true, hostel: true } } } },
                homePass: { include: { student: { select: { fullName: true, rollNo: true, hostel: true } } } },
            },
            orderBy: { timestamp: "desc" },
            take: 50
        });

        const transformedLogs = logs.map(log => {
            const pass = log.chandakaPass || log.bhubaneswarPass || log.homePass;
            const passType = log.chandakaPass ? 'CHANDAKA' : log.bhubaneswarPass ? 'BHUBANESWAR' : 'HOME_OTHER';
            return {
                ...log,
                action: log.action.toLowerCase(),
                gatepass_id: pass?.id,
                destination_type: passType.toLowerCase(),
                profiles: pass?.student ? {
                    full_name: pass.student.fullName,
                    roll_no: pass.student.rollNo,
                    hostel: pass.student.hostel,
                    parent_contact: pass.student.parentContact,
                } : null
            };
        });

        res.json(transformedLogs);
    } catch (error) {
        console.error("Get Scan Logs Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
