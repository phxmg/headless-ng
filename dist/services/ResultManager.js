"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResultManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
class ResultManager {
    constructor(baseDir = path_1.default.join(electron_1.app.getPath('userData'), 'results')) {
        this.baseDir = baseDir;
        this.ensureDirectoryExists(this.baseDir);
    }
    ensureDirectoryExists(dir) {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
    createRunDirectory(sequenceName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const runDir = path_1.default.join(this.baseDir, sequenceName, timestamp);
        this.ensureDirectoryExists(runDir);
        return runDir;
    }
    async saveScreenshot(page, runDir, name) {
        const filename = `${name}.png`;
        const filepath = path_1.default.join(runDir, filename);
        await page.screenshot({ path: filepath, fullPage: true });
        return filepath;
    }
    saveResults(runDir, results) {
        const filepath = path_1.default.join(runDir, 'results.json');
        fs_1.default.writeFileSync(filepath, JSON.stringify(results, null, 2));
        return filepath;
    }
    getRunHistory(sequenceName) {
        const sequenceDir = path_1.default.join(this.baseDir, sequenceName);
        if (!fs_1.default.existsSync(sequenceDir))
            return [];
        return fs_1.default.readdirSync(sequenceDir)
            .filter(dir => fs_1.default.statSync(path_1.default.join(sequenceDir, dir)).isDirectory())
            .map(dir => ({
            timestamp: dir,
            path: path_1.default.join(sequenceDir, dir),
            results: this.loadResults(path_1.default.join(sequenceDir, dir, 'results.json'))
        }));
    }
    loadResults(filepath) {
        if (!fs_1.default.existsSync(filepath))
            return null;
        return JSON.parse(fs_1.default.readFileSync(filepath, 'utf8'));
    }
    async compareScreenshots(image1Path, image2Path) {
        const { PNG } = require('pngjs');
        const pixelmatch = require('pixelmatch');
        const img1 = PNG.sync.read(fs_1.default.readFileSync(image1Path));
        const img2 = PNG.sync.read(fs_1.default.readFileSync(image2Path));
        const { width, height } = img1;
        const diff = new PNG({ width, height });
        const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, { threshold: 0.1 });
        return {
            diffCount: numDiffPixels,
            diffPercentage: (numDiffPixels / (width * height)) * 100,
            diffImageBuffer: PNG.sync.write(diff)
        };
    }
    saveErrorLog(runDir, errorLog) {
        const logPath = path_1.default.join(runDir, `error_${Date.now()}.json`);
        fs_1.default.writeFileSync(logPath, JSON.stringify(errorLog, null, 2));
        return logPath;
    }
}
exports.ResultManager = ResultManager;
//# sourceMappingURL=ResultManager.js.map