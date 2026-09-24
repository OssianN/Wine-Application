/**
 * @jest-environment node
 */
import { execFileSync, spawn } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import sharp from 'sharp';

const UI_DIR = __dirname;
const ROOT = path.join(UI_DIR, '../..');
const HTML_FIXTURE = path.join(UI_DIR, 'library-updated-toast.visual.html');
const CSS_FIXTURE = path.join(UI_DIR, 'library-updated-toast.visual.css');
const TOASTER_SOURCE = path.join(UI_DIR, 'toaster.tsx');
const TOAST_SOURCE = path.join(UI_DIR, 'toast.tsx');
const SCREENSHOT_NAME = 'library_updated_toast.png';
const ARTIFACTS_DIR = '/opt/cursor/artifacts';
const REPO_SCREENSHOT = path.join(UI_DIR, '__screenshots__', SCREENSHOT_NAME);

const chromePath = () => {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/local/bin/google-chrome',
  ].filter((value): value is string => Boolean(value));
  return candidates.find(candidate => fs.existsSync(candidate));
};

const wait = (ms: number) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

const compileCss = () => {
  execFileSync(
    path.join(ROOT, 'node_modules/.bin/tailwindcss'),
    [
      '-i',
      path.join(ROOT, 'app/globals.css'),
      '-o',
      CSS_FIXTURE,
      '--content',
      HTML_FIXTURE,
    ],
    { cwd: ROOT }
  );
};

const captureScreenshot = (chrome: string, outputPath: string) => {
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-toast-'));
  const env = { ...process.env };
  delete env.DBUS_SESSION_BUS_ADDRESS;
  const child = spawn(
    chrome,
    [
      '--headless=old',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--hide-scrollbars',
      '--no-first-run',
      '--disable-extensions',
      `--user-data-dir=${profileDir}`,
      '--window-size=520,240',
      `--screenshot=${outputPath}`,
      `file://${HTML_FIXTURE}`,
    ],
    {
      cwd: UI_DIR,
      env,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );

  let stdout = '';
  let stderr = '';
  child.stdout?.on('data', chunk => {
    stdout += chunk.toString();
  });
  child.stderr?.on('data', chunk => {
    stderr += chunk.toString();
  });

  const started = Date.now();
  while (Date.now() - started < 15000) {
    if (fs.existsSync(outputPath) && fs.statSync(outputPath).size >= 2000) {
      try {
        process.kill(-child.pid!, 'SIGKILL');
      } catch {
        child.kill('SIGKILL');
      }
      return;
    }
    wait(100);
  }

  try {
    process.kill(-child.pid!, 'SIGKILL');
  } catch {
    child.kill('SIGKILL');
  }
  throw new Error(
    `Toast screenshot was not captured.\nstdout: ${stdout}\nstderr: ${stderr}`
  );
};

const isBackground = (r: number, g: number, b: number) =>
  r > 100 && r < 180 && g > 120 && g < 200 && b > 140;

const isToastFill = (r: number, g: number, b: number) =>
  r > 245 && g > 245 && b > 245;

const isText = (r: number, g: number, b: number) =>
  r < 70 && g < 70 && b < 70;

const pixelAt = (
  data: Buffer,
  width: number,
  channels: number,
  x: number,
  y: number
) => {
  const i = (y * width + x) * channels;
  return [data[i], data[i + 1], data[i + 2]] as const;
};

const firstXMatching = (
  data: Buffer,
  info: { width: number; height: number; channels: number },
  predicate: (r: number, g: number, b: number) => boolean
) => {
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const [r, g, b] = pixelAt(data, info.width, info.channels, x, y);
      if (predicate(r, g, b)) return x;
    }
  }
  return null;
};

describe('library updated toast layout', () => {
  afterAll(() => {
    if (fs.existsSync(CSS_FIXTURE)) fs.unlinkSync(CSS_FIXTURE);
  });

  it('uses a full-width left-aligned copy block', () => {
    const toasterSource = fs.readFileSync(TOASTER_SOURCE, 'utf8');
    const toastSource = fs.readFileSync(TOAST_SOURCE, 'utf8');
    expect(toasterSource).toContain('grid gap-1 w-full min-w-0 text-left');
    expect(toastSource).toContain('items-stretch md:items-center');
    expect(toastSource).toContain('p-6 pr-10');
  });

  it('screenshots the success toast with normal left padding', async () => {
    const chrome = chromePath();
    if (!chrome) {
      console.warn('Skipping toast screenshot; Chrome not found');
      return;
    }

    compileCss();
    expect(fs.existsSync(CSS_FIXTURE)).toBe(true);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'toast-visual-'));
    const screenshotPath = path.join(tmpDir, SCREENSHOT_NAME);
    captureScreenshot(chrome, screenshotPath);
    expect(fs.existsSync(screenshotPath)).toBe(true);

    fs.mkdirSync(path.dirname(REPO_SCREENSHOT), { recursive: true });
    fs.copyFileSync(screenshotPath, REPO_SCREENSHOT);
    if (fs.existsSync(ARTIFACTS_DIR)) {
      fs.copyFileSync(screenshotPath, path.join(ARTIFACTS_DIR, SCREENSHOT_NAME));
    }

    const { data, info } = await sharp(screenshotPath)
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const toastLeft = firstXMatching(data, info, isToastFill);
    const textLeft = firstXMatching(data, info, isText);
    expect(toastLeft).not.toBeNull();
    expect(textLeft).not.toBeNull();

    const leftPadding = (textLeft as number) - (toastLeft as number);
    expect(leftPadding).toBeGreaterThanOrEqual(20);
    expect(leftPadding).toBeLessThan(40);

    const sample = pixelAt(data, info.width, info.channels, 8, 8);
    expect(isBackground(sample[0], sample[1], sample[2])).toBe(true);
  }, 30000);
});
