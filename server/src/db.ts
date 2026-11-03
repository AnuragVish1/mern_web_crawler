import mongoose from "mongoose";

const DEFAULT_URI = "mongodb://127.0.0.1:27017/webscout";

export async function connectDatabase(): Promise<void> {
  const uri = process.env.MONGODB_URI ?? DEFAULT_URI;

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  const { host, port, name } = mongoose.connection;
  console.log(`Connected to MongoDB at ${host}:${port}/${name}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
