import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI ?? '';

const connectMongo = async () => mongoose.connect(MONGODB_URI);

export default connectMongo;
