import { readFileSync } from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

const uriPath = path.join(process.cwd(), 'e2e', '.mongo-uri');

const connect = async () => {
  if (mongoose.connection.readyState !== 0) return;
  const uri = readFileSync(uriPath, 'utf8').trim();
  await mongoose.connect(uri);
};

export const seedForeignWine = async (shelf: number, column: number) => {
  await connect();
  const wines = mongoose.connection.collection('wines');
  const users = mongoose.connection.collection('users');
  const wine = await wines.insertOne({
    title: 'Foreign cellar bottle',
    shelf,
    column,
    archived: false,
  });
  await users.insertOne({
    name: 'Other cellar',
    email: `other-cellar-${wine.insertedId.toString()}@example.com`,
    password: 'not-used',
    wineList: [wine.insertedId],
    shelves: 8,
    columns: 8,
  });
};

export const disconnectSeed = async () => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
};
