import express from "express";
import { mentorModel, studentModel } from "../db-utils/models.js";
import { v4 } from "uuid";
import mongoose from "mongoose";

const mentorsRouter = express.Router();

// 1. Create a Mentor
mentorsRouter.post("/", async (req, res) => {
    const mentordetails = req.body;

    // Input validation
    const { name, email, expertise } = mentordetails;
    if (!name || !email || !expertise) {
        return res.status(400).json({ msg: "Name, email, and expertise are required." });
    }

    // Check for existing mentor by email
    try {
        const existingMentor = await mentorModel.findOne({ email });
        if (existingMentor) {
            return res.status(400).json({ msg: "Mentor with this email already exists." });
        }

        const mentorObj = new mentorModel({
            mentorId: v4(),
            ...mentordetails,
        });

        await mentorObj.save();
        console.log("Mentor Created Successfully:", mentorObj);
        res.status(201).json({
            msg: "Mentor Created Successfully",
            mentor: mentorObj
        });
    } catch (error) {
        console.error("Error in Creating Mentor:", error);
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                msg: "Please Check all the required Fields for Mentor Creation",
            });
        } else {
            return res.status(500).json({ msg: "Server Error" });
        }
    }
});

// 3. Assign a student to mentor
mentorsRouter.post("/:id/assign", async (req, res) => {
    const { studentIds } = req.body; // Expecting an array of studentId strings
    const mentorId = req.params.id; // Extracting mentorId from URL

    try {
        // Find the mentor by mentorId
        const mentor = await mentorModel.findOne({ mentorId });

        if (!mentor) {
            return res.status(404).json({ msg: "Mentor not found" });
        }

        // Log incoming student IDs for assignment
        console.log("Incoming student IDs for assignment:", studentIds);

        // Fetch all valid students using studentId and exclude those who already have a mentor
        const validStudents = await studentModel.find({
            studentId: { $in: studentIds }, // Match by studentId
            mentor: null, // Exclude students that already have a mentor
        });

        // Log valid students for debugging
        console.log("Valid students for assignment:", validStudents);

        // Check if any valid students exist after filtering
        if (validStudents.length === 0) {
            return res.status(400).json({
                msg: "All selected students already have a mentor or do not exist."
            });
        }

        // Only add students who are not already in the mentor's studentIds array
        const newStudentIds = validStudents
            .map((s) => s.studentId) // Extract studentId
            .filter((sid) => !mentor.studentIds.includes(sid)); // Exclude already assigned students

        // Log new student IDs for debugging
        console.log("New student IDs to assign:", newStudentIds);

        if (newStudentIds.length === 0) {
            return res.status(400).json({
                msg: "All selected students are already assigned to this mentor."
            });
        }

        // Push only new student IDs to the mentor's studentIds
        mentor.studentIds.push(...newStudentIds);

        // Update the mentor field in the student documents
        await studentModel.updateMany(
            { studentId: { $in: newStudentIds } }, // Match by studentId
            { $set: { mentor: mentorId } } // Set the mentor field (should be a string)
        );

        // Save the mentor with the updated student list
        await mentor.save();

        res.json({ msg: "Students assigned to mentor successfully", newStudents: newStudentIds });
    } catch (error) {
        console.error("Error in assigning students to mentor", error);
        res.status(500).json({ msg: "Server Error" });
    }
});

// 4. Assign or change mentor for a particular student
mentorsRouter.post("/change-mentor/:studentId", async (req, res) => {
    const { newMentorId } = req.body;
    const studentId = req.params.studentId;

    try {
        const student = await studentModel.findOne({ studentId });

        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }

        const oldMentorId = student.mentor; // Current mentor
        const newMentor = await mentorModel.findOne({ mentorId: newMentorId });

        if (!newMentor) {
            return res.status(404).json({ msg: "New Mentor not found" });
        }

        if (oldMentorId && oldMentorId === newMentorId) {
            return res.status(400).json({ msg: "Student is already assigned to this mentor." });
        }

        // Remove the student from the old mentor's student list (if they had a mentor)
        if (oldMentorId) {
            const oldMentor = await mentorModel.findOne({ mentorId: oldMentorId });
            if (oldMentor) {
                oldMentor.studentIds = oldMentor.studentIds.filter(
                    (id) => id !== studentId
                );
                await oldMentor.save();
            }
        }

        // Update the student: set new mentor and update prevMentors list
        if (oldMentorId) {
            student.prevMentors.push(oldMentorId); // Add the old mentor to previous mentors
        }
        student.mentor = newMentorId; // Assign the new mentor
        await student.save();

        // Add the student to the new mentor's student list
        if (!newMentor.studentIds.includes(studentId)) {
            newMentor.studentIds.push(studentId);
            await newMentor.save();
        }

        res.json({ msg: "Mentor changed successfully for the student" });
    } catch (error) {
        console.log("Error in changing mentor for the student", error);
        res.status(500).json({ msg: "Server Error" });
    }
});

// 5. API to show all students for a particular mentor
mentorsRouter.get("/:mentorId/students", async (req, res) => {
    const mentorId = req.params.mentorId;

    try {
        const mentor = await mentorModel.findOne({ mentorId });

        if (!mentor) {
            return res.status(404).json({ msg: "Mentor not found" });
        }

        const students = await studentModel.find({ mentor: mentorId });

        if (students.length === 0) {
            return res.status(200).json({ msg: "No students assigned to this mentor.", students: [] });
        }

        res.json(students);
    } catch (error) {
        console.error("Error in fetching students for the mentor", error);
        res.status(500).json({ msg: "Server Error" });
    }
});

export default mentorsRouter;
