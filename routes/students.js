import express from "express";
import { mentorModel, studentModel } from "../db-utils/models.js";
import { v4 } from "uuid";
import mongoose from "mongoose";

const studentsRouter = express.Router();

// 2. Create a Student:
studentsRouter.post("/", async (req, res) => {
    const studentdetails = req.body;

    // Input validation
    const { name, email, age } = studentdetails;
    if (!name || !email || !age) {
        return res.status(400).json({ msg: "Name, email, and age are required." });
    }

    // Check for existing student by email
    try {
        const existingStudent = await studentModel.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ msg: "Student with this email already exists." });
        }

        const studentObj = new studentModel({
            studentId: v4(),
            ...studentdetails,
        });

        await studentObj.save();
        console.log("Student Created Successfully:", studentObj);
        res.status(201).json({
            msg: "Student Created Successfully",
            student: studentObj
        });
    } catch (error) {
        console.error("Error in Creating Student:", error);
        if (error instanceof mongoose.Error.ValidationError) {
            return res.status(400).json({
                msg: "Please Check all the required Fields for Student Creation",
            });
        } else {
            return res.status(500).json({ msg: "Server Error" });
        }
    }
});

// 6. API to show the previously assigned mentor for a particular Student:
studentsRouter.get("/:studentId/previous-mentors", async (req, res) => {
    const studentId = req.params.studentId; // Get the studentId from the URL

    try {
        // Find the student by studentId
        const student = await studentModel.findOne({ studentId });

        if (!student) {
            return res.status(404).json({ msg: "Student not found" });
        }

        // Fetch previous mentors from the student's prevMentors array
        const previousMentors = student.prevMentors; // This will be an array of mentor IDs

        // Check if there are any previous mentors
        if (previousMentors.length === 0) {
            return res.status(200).json({ msg: "No previously assigned mentors for this student." });
        }

        // Fetch mentor details based on mentorId (which should match the previousMentors array)
        const mentorDetails = await mentorModel.find({ mentorId: { $in: previousMentors } });

        res.json(mentorDetails);
    } catch (error) {
        console.error("Error in fetching previous mentors for the student", error);
        res.status(500).json({ msg: "Server Error" });
    }
});

export default studentsRouter;
