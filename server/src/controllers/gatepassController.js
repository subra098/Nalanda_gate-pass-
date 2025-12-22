import prisma from "../config/db.js";

// Create a new gatepass request
export const createGatepass = async (req, res) => {
    try {
        const { destinationType, destinationDetails, reason, expectedReturnAt } = req.body;
        const studentId = req.user.id;

        // Convert destinationType to uppercase to match Prisma enum
        const destinationTypeUpper = destinationType.toUpperCase();

        // Optional: Check if student already has an active pass?

        const gatepass = await prisma.gatepass.create({
            data: {
                studentId,
                destinationType: destinationTypeUpper,
                destinationDetails,
                reason,
                expectedReturnAt: new Date(expectedReturnAt),
                status: "PENDING",
            },
        });

        res.status(201).json(gatepass);
    } catch (error) {
        console.error("Create Gatepass Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get passes for the logged-in student
export const getMyPasses = async (req, res) => {
    try {
        const studentId = req.user.id;
        const passes = await prisma.gatepass.findMany({
            where: { studentId },
            orderBy: { createdAt: "desc" },
        });

        // Transform to match frontend expectations (snake_case)
        const transformedPasses = passes.map(pass => ({
            ...pass,
            destination_type: pass.destinationType,
            destination_details: pass.destinationDetails,
            expected_return_at: pass.expectedReturnAt,
            qr_code_data: pass.qrCodeData,
            parent_confirmed: pass.parentConfirmed,
            attendant_id: pass.attendantId,
            superintendent_id: pass.superintendentId,
            attendant_notes: pass.attendantNotes,
            superintendent_notes: pass.superintendentNotes,
            created_at: pass.createdAt,
            updated_at: pass.updatedAt,
            student_id: pass.studentId,
            status: pass.status.toLowerCase(),
        }));

        res.json(transformedPasses);
    } catch (error) {
        console.error("Get My Passes Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get pending passes (For Attendants/Superintendents)
// Filter by hostel if needed (fetched from user logs)
export const getPendingPasses = async (req, res) => {
    try {
        // Ideally we filter by student's hostel matching the attendant's hostel
        // For now, returning all pending
        const passes = await prisma.gatepass.findMany({
            where: { status: "PENDING" },
            include: { student: { select: { fullName: true, rollNo: true, hostel: true } } },
            orderBy: { createdAt: "asc" },
        });
        res.json(passes);
    } catch (error) {
        console.error("Get Pending Passes Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get passes (Generic filter)
export const getPasses = async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};
        if (status) {
            // Allow multiple statuses comma-separated
            const statuses = status.split(',');
            where.status = { in: statuses };
        }

        const passes = await prisma.gatepass.findMany({
            where,
            include: { student: { select: { id: true, email: true, fullName: true, rollNo: true, hostel: true, parentContact: true } } },
            orderBy: { createdAt: "desc" },
        });

        // Transform to match frontend expectations
        const transformedPasses = passes.map(pass => ({
            ...pass,
            destination_type: pass.destinationType,
            destination_details: pass.destinationDetails,
            expected_return_at: pass.expectedReturnAt,
            qr_code_data: pass.qrCodeData,
            parent_confirmed: pass.parentConfirmed,
            attendant_id: pass.attendantId,
            superintendent_id: pass.superintendentId,
            attendant_notes: pass.attendantNotes,
            superintendent_notes: pass.superintendentNotes,
            created_at: pass.createdAt,
            updated_at: pass.updatedAt,
            student_id: pass.studentId,
            status: pass.status.toLowerCase(),
            // Transform student object if present
            profiles: pass.student ? {
                id: pass.student.id,
                email: pass.student.email,
                full_name: pass.student.fullName,
                roll_no: pass.student.rollNo,
                hostel: pass.student.hostel,
                parent_contact: pass.student.parentContact,
            } : null,
        }));

        res.json(transformedPasses);
    } catch (error) {
        console.error("Get Passes Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Approve/Reject Pass
export const updatePassStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body; // status: APPROVED, REJECTED
        const userId = req.user.id;
        const userRole = req.user.role;

        // Define next status based on role and action
        let newStatus = status;

        // Generating QR Code if fully approved
        let qrCodeData = null;

        if (status === "APPROVED") {
            if (userRole === "HOSTEL_ATTENDANT") newStatus = "ATTENDANT_APPROVED";
            if (userRole === "SUPERINTENDENT") {
                newStatus = "SUPERINTENDENT_APPROVED";
                // Store JSON string for QR code generation/scanning
                qrCodeData = JSON.stringify({ passId: id });
            }
        } else if (status === "REJECTED") {
            newStatus = "REJECTED";
        }

        const updateData = {
            status: newStatus,
            qrCodeData,
        };

        if (userRole === "HOSTEL_ATTENDANT") {
            updateData.attendantId = userId;
            updateData.attendantNotes = notes;
        } else if (userRole === "SUPERINTENDENT") {
            updateData.superintendentId = userId;
            updateData.superintendentNotes = notes;
        }

        const gatepass = await prisma.gatepass.update({
            where: { id },
            data: updateData,
        });

        res.json(gatepass);
    } catch (error) {
        console.error("Update Pass Status Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
