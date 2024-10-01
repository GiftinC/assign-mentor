import express from "express";
import { connectDb, connectMongoose } from "./db-utils/db-connection.js";
import mentorsRouter from "./routes/mentors.js";
import studentsRouter from "./routes/students.js";
// Create a Server:
const server = express();

// Middleware used by server to read the body of a request:
server.use(express.json());

// Link all the Routers with Express Server:
server.use("/mentors", mentorsRouter);
server.use("/students", studentsRouter)

// connect to Database using Top level Module await:
await connectDb();
await connectMongoose();

// Create a PORT:
const PORT = 3000;

// Server Listening to the PORT:
server.listen(PORT, () => {
  console.log("Server running on ", `"http://localhost:${PORT}"`);
});


