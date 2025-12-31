import prisma from "../config/db.js";

// Create a new gatepass request
export const createGatepass = async (req, res) => {
    try {
        console.log("Create Gatepass Request Body:", req.body);
        const { destinationType, destinationDetails, reason, expectedReturnAt, ...homeFields } = req.body;
        const studentId = req.user.id;
        const type = destinationType.toUpperCase();

        // Fetch student details to get name
        const student = await prisma.user.findUnique({
            where: { id: studentId },
            select: { fullName: true }
        });
        const studentName = student?.fullName || "Unknown";

        let gatepass;

        if (type === "CHANDAKA") {
            gatepass = await prisma.chandakaPass.create({
                data: {
                    studentId,
                    studentName,
                    destinationDetails,
                    reason,
                    expectedReturnAt: new Date(expectedReturnAt),
                },
            });
        } else if (type === "BHUBANESWAR") {
            gatepass = await prisma.bhubaneswarPass.create({
                data: {
                    studentId,
                    studentName,
                    destinationDetails,
                    reason,
                    expectedReturnAt: new Date(expectedReturnAt),
                },
            });
        } else if (type === "HOME_OTHER") {
            // Validate dates
            const fDate = new Date(homeFields.fromDate);
            const rDate = new Date(expectedReturnAt);

            if (isNaN(fDate.getTime()) || isNaN(rDate.getTime())) {
                return res.status(400).json({ message: "Invalid date format provided" });
            }

            gatepass = await prisma.homePass.create({
                data: {
                    studentId,
                    studentName,
                    roomNo: homeFields.roomNo || "N/A",
                    branch: homeFields.branch || "N/A",
                    semester: homeFields.semester || "N/A",
                    section: homeFields.section || "N/A",
                    purpose: reason || "No reason specified",
                    fromDate: fDate,
                    expectedReturnAt: rDate,
                    destinationAddress: homeFields.destinationAddress || "N/A",
                    meansOfTravel: (homeFields.meansOfTravel && homeFields.meansOfTravel !== "") ? homeFields.meansOfTravel : "Other",
                    localGuardianName: homeFields.localGuardianName || null,
                    localGuardianContact: homeFields.localGuardianContact || null,
                    parentName: homeFields.parentName || null,
                },
            });
        }

        res.status(201).json({ ...gatepass, destination_type: type });
    } catch (error) {
        console.error("Create Gatepass Detailed Error:", error);
        res.status(500).json({ message: error.message || "Internal server error" });
    }
};

const transformPass = (pass, type) => ({
    ...pass,
    destination_type: type.toLowerCase(),
    destination_details: pass.destinationDetails || pass.destinationAddress,
    expected_return_at: pass.expectedReturnAt,
    qr_code_data: pass.qrCodeData,
    attendant_id: pass.attendantId,
    superintendent_id: pass.superintendentId,
    attendant_notes: pass.attendantNotes,
    superintendent_notes: pass.superintendentNotes,
    created_at: pass.createdAt,
    updated_at: pass.updatedAt,
    student_id: pass.studentId,
    status: pass.status.toLowerCase(),
    // Home specific fields
    room_no: pass.roomNo,
    branch: pass.branch,
    semester: pass.semester,
    section: pass.section,
    from_date: pass.fromDate,
    destination_address: pass.destinationAddress,
    means_of_travel: pass.meansOfTravel,
    local_guardian_name: pass.localGuardianName,
    local_guardian_contact: pass.localGuardianContact,
    parent_name: pass.parentName,
    profiles: pass.student ? {
        id: pass.student.id,
        email: pass.student.email,
        full_name: pass.student.fullName,
        roll_no: pass.student.rollNo,
        hostel: pass.student.hostel,
        parent_contact: pass.student.parentContact,
    } : null,
});

// Get passes for the logged-in student
export const getMyPasses = async (req, res) => {
    try {
        const studentId = req.user.id;
        const include = { student: { select: { id: true, email: true, fullName: true, rollNo: true, hostel: true, parentContact: true } } };

        const [chandaka, bhubaneswar, home] = await Promise.all([
            prisma.chandakaPass.findMany({ where: { studentId }, include, orderBy: { createdAt: "desc" } }),
            prisma.bhubaneswarPass.findMany({ where: { studentId }, include, orderBy: { createdAt: "desc" } }),
            prisma.homePass.findMany({ where: { studentId }, include, orderBy: { createdAt: "desc" } }),
        ]);

        const allPasses = [
            ...chandaka.map(p => transformPass(p, "CHANDAKA")),
            ...bhubaneswar.map(p => transformPass(p, "BHUBANESWAR")),
            ...home.map(p => transformPass(p, "HOME_OTHER")),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json(allPasses);
    } catch (error) {
        console.error("Get My Passes Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get pending passes (For Attendants/Superintendents)
export const getPendingPasses = async (req, res) => {
    try {
        const include = { student: { select: { fullName: true, rollNo: true, hostel: true } } };
        const [chandaka, bhubaneswar, home] = await Promise.all([
            prisma.chandakaPass.findMany({ where: { status: "PENDING" }, include, orderBy: { createdAt: "asc" } }),
            prisma.bhubaneswarPass.findMany({ where: { status: "PENDING" }, include, orderBy: { createdAt: "asc" } }),
            prisma.homePass.findMany({ where: { status: "PENDING" }, include, orderBy: { createdAt: "asc" } }),
        ]);

        res.json([...chandaka, ...bhubaneswar, ...home]);
    } catch (error) {
        console.error("Get Pending Passes Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Get passes (Generic filter)
export const getPasses = async (req, res) => {
    try {
        const { status } = req.query;
        const where = status ? { status: { in: status.split(',') } } : {};
        const include = { student: { select: { id: true, email: true, fullName: true, rollNo: true, hostel: true, parentContact: true } } };

        const [chandaka, bhubaneswar, home] = await Promise.all([
            prisma.chandakaPass.findMany({ where, include, orderBy: { createdAt: "desc" } }),
            prisma.bhubaneswarPass.findMany({ where, include, orderBy: { createdAt: "desc" } }),
            prisma.homePass.findMany({ where, include, orderBy: { createdAt: "desc" } }),
        ]);

        const allPasses = [
            ...chandaka.map(p => transformPass(p, "CHANDAKA")),
            ...bhubaneswar.map(p => transformPass(p, "BHUBANESWAR")),
            ...home.map(p => transformPass(p, "HOME_OTHER")),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        res.json(allPasses);
    } catch (error) {
        console.error("Get Passes Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Approve/Reject Pass
export const updatePassStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, notes } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        let newStatus = status === "APPROVED"
            ? (userRole === "HOSTEL_ATTENDANT" ? "ATTENDANT_APPROVED" : "SUPERINTENDENT_APPROVED")
            : "REJECTED";

        let qrCodeData = (newStatus === "SUPERINTENDENT_APPROVED") ? JSON.stringify({ passId: id }) : null;

        const updateData = { status: newStatus, qrCodeData };
        if (userRole === "HOSTEL_ATTENDANT") {
            updateData.attendantId = userId;
            updateData.attendantNotes = notes;
        } else if (userRole === "SUPERINTENDENT") {
            updateData.superintendentId = userId;
            updateData.superintendentNotes = notes;
        }

        // Try updating in each table until success
        let updatedPass;
        try {
            updatedPass = await prisma.chandakaPass.update({ where: { id }, data: updateData });
        } catch (e) {
            try {
                updatedPass = await prisma.bhubaneswarPass.update({ where: { id }, data: updateData });
            } catch (e2) {
                updatedPass = await prisma.homePass.update({ where: { id }, data: updateData });
            }
        }

        res.json(updatedPass);
    } catch (error) {
        console.error("Update Pass Status Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
