'use server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? '';

export const connectMongo = async () => mongoose.connect(MONGODB_URI);
