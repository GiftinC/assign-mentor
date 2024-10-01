import { model, Schema, mongoose } from "mongoose";

// Create Schema's:
const mentorSchema = new Schema({
  mentorId: {
    type: String, // UUID as a string
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  expertise: {
    type: String,
    required: true,
  },
  studentIds: [{
    type: String,
    ref: 'Student',
    default: []
  }]
});

const studentSchema = new mongoose.Schema({
  studentId: {
    type: String, // UUID as a string
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  age: {
    type: Number,
    required: true,
  },
  mentor: {
    type: String,
    required: false,
    default: null,
  },
  prevMentors: {
    type: [String],
    required: false,
    default: [],
  },
});

// Create models using the schemas:
export const mentorModel = model("Mentor", mentorSchema, "mentors");
export const studentModel = model("Student", studentSchema, "students");
