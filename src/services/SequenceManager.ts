import fs from 'fs';
import path from 'path';
import { app } from 'electron';

export class SequenceManager {
  baseDir: string;

  constructor(baseDir: string = path.join(app.getPath('userData'), 'sequences')) {
    this.baseDir = baseDir;
    this.ensureDirectoryExists(this.baseDir);
  }

  ensureDirectoryExists(dir: string) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  saveSequence(sequence: any): string {
    if (!sequence.name) {
      throw new Error('Sequence must have a name');
    }
    const filename = `${sequence.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const filepath = path.join(this.baseDir, filename);
    const sequenceData = {
      ...sequence,
      lastModified: new Date().toISOString(),
    };
    fs.writeFileSync(filepath, JSON.stringify(sequenceData, null, 2));
    return filepath;
  }

  loadSequence(name: string): any {
    const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const filepath = path.join(this.baseDir, filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Sequence '${name}' not found`);
    }
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  }

  getAllSequences(): any[] {
    return fs.readdirSync(this.baseDir)
      .filter(file => file.endsWith('.json'))
      .map(file => JSON.parse(fs.readFileSync(path.join(this.baseDir, file), 'utf8')));
  }

  deleteSequence(name: string): void {
    const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    const filepath = path.join(this.baseDir, filename);
    if (!fs.existsSync(filepath)) {
      throw new Error(`Sequence '${name}' not found`);
    }
    fs.unlinkSync(filepath);
  }
} 