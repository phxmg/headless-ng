"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceManager = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const electron_1 = require("electron");
class SequenceManager {
    constructor(baseDir = path_1.default.join(electron_1.app.getPath('userData'), 'sequences')) {
        this.baseDir = baseDir;
        this.ensureDirectoryExists(this.baseDir);
    }
    ensureDirectoryExists(dir) {
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
    }
    saveSequence(sequence) {
        if (!sequence.name) {
            throw new Error('Sequence must have a name');
        }
        const filename = `${sequence.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        const filepath = path_1.default.join(this.baseDir, filename);
        const sequenceData = {
            ...sequence,
            lastModified: new Date().toISOString(),
        };
        fs_1.default.writeFileSync(filepath, JSON.stringify(sequenceData, null, 2));
        return filepath;
    }
    loadSequence(name) {
        const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        const filepath = path_1.default.join(this.baseDir, filename);
        if (!fs_1.default.existsSync(filepath)) {
            throw new Error(`Sequence '${name}' not found`);
        }
        return JSON.parse(fs_1.default.readFileSync(filepath, 'utf8'));
    }
    getAllSequences() {
        return fs_1.default.readdirSync(this.baseDir)
            .filter(file => file.endsWith('.json'))
            .map(file => JSON.parse(fs_1.default.readFileSync(path_1.default.join(this.baseDir, file), 'utf8')));
    }
    deleteSequence(name) {
        const filename = `${name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
        const filepath = path_1.default.join(this.baseDir, filename);
        if (!fs_1.default.existsSync(filepath)) {
            throw new Error(`Sequence '${name}' not found`);
        }
        fs_1.default.unlinkSync(filepath);
    }
}
exports.SequenceManager = SequenceManager;
//# sourceMappingURL=SequenceManager.js.map