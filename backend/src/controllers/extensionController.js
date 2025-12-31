import prisma from "../config/db.js";

export const createExtensionRequest = async (req, res) => {
    try {
        const { passId, passType, reason, newExpectedReturnAt } = req.body;
        const userId = req.user.id;

        // Validate pass type
        if (!['chandaka', 'bhubaneswar', 'home'].includes(passType)) {
            return res.status(400).json({ message: "Invalid pass type" });
        }

        // Verify the pass belongs to the user
        const passField = `${passType}PassId`;
        const passModel = passType === 'chandaka' ? 'chandakaPass' :
            passType === 'bhubaneswar' ? 'bhubaneswarPass' : 'homePass';

        const pass = await prisma[passModel].findUnique({
            where: { id: passId },
        });

        if (!pass || pass.studentId !== userId) {
            return res.status(404).json({ message: "Pass not found" });
        }

        // Create extension request
        const extensionData = {
            reason,
            newExpectedReturnAt: new Date(newExpectedReturnAt),
            status: 'PENDING',
        };
        extensionData[`${passType}PassId`] = passId;

        const extension = await prisma.extensionRequest.create({
            data: extensionData,
        });

        res.status(201).json(extension);
    } catch (error) {
        console.error("Extension request error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getMyExtensionRequests = async (req, res) => {
    try {
        const userId = req.user.id;

        const extensions = await prisma.extensionRequest.findMany({
            where: {
                OR: [
                    { chandakaPass: { studentId: userId } },
                    { bhubaneswarPass: { studentId: userId } },
                    { homePass: { studentId: userId } },
                ],
            },
            include: {
                chandakaPass: true,
                bhubaneswarPass: true,
                homePass: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json(extensions);
    } catch (error) {
        console.error("Get extensions error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateExtensionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reviewNotes } = req.body;
        const reviewerId = req.user.id;

        const extension = await prisma.extensionRequest.update({
            where: { id },
            data: {
                status,
                reviewedBy: reviewerId,
                reviewNotes,
            },
        });

        // If approved, update the pass expected return time
        if (status === 'APPROVED') {
            if (extension.chandakaPassId) {
                await prisma.chandakaPass.update({
                    where: { id: extension.chandakaPassId },
                    data: { expectedReturnAt: extension.newExpectedReturnAt },
                });
            } else if (extension.bhubaneswarPassId) {
                await prisma.bhubaneswarPass.update({
                    where: { id: extension.bhubaneswarPassId },
                    data: { expectedReturnAt: extension.newExpectedReturnAt },
                });
            } else if (extension.homePassId) {
                await prisma.homePass.update({
                    where: { id: extension.homePassId },
                    data: { expectedReturnAt: extension.newExpectedReturnAt },
                });
            }
        }

        res.json(extension);
    } catch (error) {
        console.error("Update extension error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
