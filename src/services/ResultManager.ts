import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { Page } from 'puppeteer';

export class ResultManager {
  baseDir: string;

  constructor(baseDir: string = path.join(app.getPath('userData'), 'results')) {
    this.baseDir = baseDir;
    this.ensureDirectoryExists(this.baseDir);
  }

  ensureDirectoryExists(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  createRunDirectory(sequenceName: string): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const runDir = path.join(this.baseDir, sequenceName, timestamp);
    this.ensureDirectoryExists(runDir);
    return runDir;
  }

  async saveScreenshot(page: Page, runDir: string, name: string): Promise<string> {
    const filename = `${name}.png`;
    const filepath = path.join(runDir, filename);
    await page.screenshot({ path: filepath, fullPage: true });
    return filepath;
  }

  saveResults(runDir: string, results: any): string {
    const filepath = path.join(runDir, 'results.json');
    fs.writeFileSync(filepath, JSON.stringify(results, null, 2));
    return filepath;
  }

  getRunHistory(sequenceName: string): Array<{ timestamp: string; path: string; results: any }> {
    const sequenceDir = path.join(this.baseDir, sequenceName);
    if (!fs.existsSync(sequenceDir)) return [];
    return fs.readdirSync(sequenceDir)
      .filter(dir => fs.statSync(path.join(sequenceDir, dir)).isDirectory())
      .map(dir => ({
        timestamp: dir,
        path: path.join(sequenceDir, dir),
        results: this.loadResults(path.join(sequenceDir, dir, 'results.json'))
      }));
  }

  loadResults(filepath: string): any {
    if (!fs.existsSync(filepath)) return null;
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }

  async compareScreenshots(image1Path: string, image2Path: string) {
    const { PNG } = require('pngjs');
    const pixelmatch = require('pixelmatch');
    const img1 = PNG.sync.read(fs.readFileSync(image1Path));
    const img2 = PNG.sync.read(fs.readFileSync(image2Path));
    const { width, height } = img1;
    const diff = new PNG({ width, height });
    const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
    return {
      diffCount: numDiffPixels,
      diffPercentage: (numDiffPixels / (width * height)) * 100,
      diffImageBuffer: PNG.sync.write(diff)
    };
  }

  saveErrorLog(runDir: string, errorLog: any) {
    const logPath = path.join(runDir, `error_${Date.now()}.json`);
    fs.writeFileSync(logPath, JSON.stringify(errorLog, null, 2));
    return logPath;
  }
} 