import cron from 'node-cron';
import fs from 'fs';
import path from 'path';

export class ScheduleManager {
  sequenceManager: any;
  player: any;
  schedules: Map<string, any>;
  scheduleFile: string;

  constructor(sequenceManager: any, player: any, scheduleFile: string = path.join(process.cwd(), 'schedules.json')) {
    this.sequenceManager = sequenceManager;
    this.player = player;
    this.schedules = new Map();
    this.scheduleFile = scheduleFile;
    this.loadSavedSchedules();
  }

  scheduleSequence(sequenceName: string, cronExpression: string, options: any = {}) {
    if (this.schedules.has(sequenceName)) {
      this.unscheduleSequence(sequenceName);
    }
    const task = cron.schedule(cronExpression, async () => {
      try {
        const sequence = this.sequenceManager.loadSequence(sequenceName);
        await this.player.initialize();
        await this.player.play(sequence, options);
      } catch (error) {
        console.error(`Error executing scheduled sequence ${sequenceName}:`, error);
      }
    });
    this.schedules.set(sequenceName, {
      task,
      cronExpression,
      options,
      nextRun: this.getNextRunDate(cronExpression)
    });
    this.saveSchedules();
    return true;
  }

  unscheduleSequence(sequenceName: string) {
    const schedule = this.schedules.get(sequenceName);
    if (schedule) {
      schedule.task.stop();
      this.schedules.delete(sequenceName);
      this.saveSchedules();
      return true;
    }
    return false;
  }

  // node-cron does not provide next run time natively. This is a placeholder.
  getNextRunDate(cronExpression: string) {
    // Could use a library like cron-parser for actual next run time.
    return '-';
  }

  getAllSchedules() {
    const result: any = {};
    for (const [name, schedule] of this.schedules.entries()) {
      result[name] = {
        cronExpression: schedule.cronExpression,
        options: schedule.options,
        nextRun: this.getNextRunDate(schedule.cronExpression)
      };
    }
    return result;
  }

  saveSchedules() {
    const data: any = {};
    for (const [name, schedule] of this.schedules.entries()) {
      data[name] = {
        cronExpression: schedule.cronExpression,
        options: schedule.options
      };
    }
    fs.writeFileSync(this.scheduleFile, JSON.stringify(data, null, 2));
  }

  loadSavedSchedules() {
    if (!fs.existsSync(this.scheduleFile)) return;
    const data = JSON.parse(fs.readFileSync(this.scheduleFile, 'utf8'));
    for (const name in data) {
      const { cronExpression, options } = data[name];
      this.scheduleSequence(name, cronExpression, options);
    }
  }
} 