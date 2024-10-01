import mongodb from "mongodb";
import mongoose from "mongoose";

// MongoDB Local DB URL:
const host = "127.0.0.1:27017";
const dbName = "Assign-Mentor";

// MongoDB Client:
// const mongoDbClient = new mongodb.MongoClient(`mongodb://${host}`);

// Atlas Cloud DB URL:
const atlasCloudUrl =
  "mongodb+srv://cgiftin:0vZY5gnFqHJSnykD@cluster0.pgk37.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Atlas Client:
const atlasClient = new mongodb.MongoClient(atlasCloudUrl);

// Created a Db to write queries:
// export const db = mongoDbClient.db(dbName);

// Function to establish a connection to the database:
export const connectDb = async () => {
  try {
    // Connect to the MongoDB database using the Client & (returns a promise object):
    await atlasClient.connect();
    // If the connection is successful:
    console.log("Connected to DB");
  } catch (error) {
    // If the connection fails:
    console.error("error to connect DB", error);
    // Exit the process:
    process.exit();
  }
};

// DB URL:
const localDbUrl = `mongodb://${host}/${dbName}`;

const cloudDbUrl = `mongodb+srv://cgiftin:0vZY5gnFqHJSnykD@cluster0.pgk37.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

// Function to establish a connection to the database via Mongoose:
export const connectMongoose = async () => {
  try {
    // Connect to the MongoDB database using Mongoose & (returns a promise object):
    await mongoose.connect(cloudDbUrl);
    // If the connection is successful:
    console.log("Connected to DB via Mongoose");
  } catch (error) {
    // If the connection fails:
    console.error("error to connect Mongoose", error);
    // Exit the process:
    process.exit(1);
  }
};


