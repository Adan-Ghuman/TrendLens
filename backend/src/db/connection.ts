import mongoose from "mongoose";
import {env} from "../config/env.js";
import {logger} from "../utils/logger.js";

let connectPromise: Promise<typeof mongoose> | null = null;

export const connectToDatabase = async (): Promise<typeof mongoose> => {
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (!connectPromise) {
    connectPromise = mongoose.connect(env.mongodbUri);
  }

  try {
    const connection = await connectPromise;
    logger.info("MongoDB connection successful", {
      host: connection.connection.host,
      dbName: connection.connection.name,
    });
    return connection;
  } catch (error) {
    connectPromise = null;
    throw error;
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectPromise = null;
};

export const isDatabaseConnected = (): boolean =>
  mongoose.connection.readyState === 1;
