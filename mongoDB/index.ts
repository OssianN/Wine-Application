'use server';
import mongoose, { Connection } from 'mongoose';

let cachedConnection: Connection | null = null;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable.');
}

export async function connectMongo() {
  if (cachedConnection) {
    return cachedConnection;
  }
  try {
    const { connection } = await mongoose.connect(process.env.MONGODB_URI!);
    cachedConnection = connection;
    return cachedConnection;
  } catch (e: unknown) {
    console.error('Could not connect to MongoDB:', e);
  }
}
