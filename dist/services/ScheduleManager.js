"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleManager = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ScheduleManager {
    constructor(sequenceManager, player, scheduleFile = path_1.default.join(process.cwd(), 'schedules.json')) {
        this.sequenceManager = sequenceManager;
        this.player = player;
        this.schedules = new Map();
        this.scheduleFile = scheduleFile;
        this.loadSavedSchedules();
    }
    scheduleSequence(sequenceName, cronExpression, options = {}) {
        if (this.schedules.has(sequenceName)) {
            this.unscheduleSequence(sequenceName);
        }
        const task = node_cron_1.default.schedule(cronExpression, async () => {
            try {
                const sequence = this.sequenceManager.loadSequence(sequenceName);
                await this.player.initialize();
                await this.player.play(sequence, options);
            }
            catch (error) {
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
    unscheduleSequence(sequenceName) {
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
    getNextRunDate(cronExpression) {
        // Could use a library like cron-parser for actual next run time.
        return '-';
    }
    getAllSchedules() {
        const result = {};
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
        const data = {};
        for (const [name, schedule] of this.schedules.entries()) {
            data[name] = {
                cronExpression: schedule.cronExpression,
                options: schedule.options
            };
        }
        fs_1.default.writeFileSync(this.scheduleFile, JSON.stringify(data, null, 2));
    }
    loadSavedSchedules() {
        if (!fs_1.default.existsSync(this.scheduleFile))
            return;
        const data = JSON.parse(fs_1.default.readFileSync(this.scheduleFile, 'utf8'));
        for (const name in data) {
            const { cronExpression, options } = data[name];
            this.scheduleSequence(name, cronExpression, options);
        }
    }
}
exports.ScheduleManager = ScheduleManager;
//# sourceMappingURL=ScheduleManager.js.map