import { spawn } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MongoMemoryServer } from 'mongodb-memory-server';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = '3210';
const uriFile = path.join(root, 'e2e', '.mongo-uri');

const mongod = await MongoMemoryServer.create();
const uri = mongod.getUri('wine-e2e');
writeFileSync(uriFile, uri);

const next = spawn(
  'yarn',
  ['next', 'dev', '--port', port, '--hostname', '127.0.0.1'],
  {
    cwd: root,
    env: {
      ...process.env,
      MONGODB_URI: uri,
      SECRET_COOKIE_PASSWORD: '0123456789abcdef0123456789abcdef',
    },
    stdio: 'inherit',
  }
);

let stopping = false;

const stop = async code => {
  if (stopping) return;
  stopping = true;
  next.kill('SIGTERM');
  await mongod.stop();
  process.exit(code);
};

process.on('SIGTERM', () => {
  void stop(0);
});
process.on('SIGINT', () => {
  void stop(0);
});
next.on('exit', code => {
  if (!stopping) {
    void mongod.stop().finally(() => process.exit(code ?? 1));
  }
});
