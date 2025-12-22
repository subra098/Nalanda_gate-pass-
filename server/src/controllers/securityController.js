import prisma from "../config/db.js";

export const scanQrCode = async (req, res) => {
    try {
        const { gatepassId, type } = req.body; // type: ENTRY or EXIT
        const securityGuardId = req.user.id;

        const gatepass = await prisma.gatepass.findUnique({
            where: { id: gatepassId },
        });

        if (!gatepass) {
            return res.status(404).json({ message: "Gatepass not found" });
        }

        // Validate Status
        if (type === "EXIT" && gatepass.status !== "SUPERINTENDENT_APPROVED") {
            return res.status(400).json({ message: "Pass not approved for exit" });
        }

        // Update Gatepass status
        const newStatus = type === "EXIT" ? "EXITED" : "ENTERED";

        await prisma.$transaction([
            prisma.gatepass.update({
                where: { id: gatepassId },
                data: { status: newStatus }
            }),
            prisma.scanLog.create({
                data: {
                    gatepassId,
                    securityGuardId,
                    action: type,
                }
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
                gatepass: {
                    include: {
                        student: { select: { fullName: true, rollNo: true, hostel: true } }
                    }
                }
            },
            orderBy: { timestamp: "desc" },
            take: 50
        });

        const transformedLogs = logs.map(log => ({
            ...log,
            action: log.action.toLowerCase()
        }));

        res.json(transformedLogs);
    } catch (error) {
        console.error("Get Scan Logs Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}
