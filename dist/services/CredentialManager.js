"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CredentialManager = void 0;
const keytar_1 = __importDefault(require("keytar"));
class CredentialManager {
    constructor(serviceName = 'HeadlessPilot') {
        this.serviceName = serviceName;
    }
    async saveCredential(key, value) {
        return await keytar_1.default.setPassword(this.serviceName, key, value);
    }
    async getCredential(key) {
        return await keytar_1.default.getPassword(this.serviceName, key);
    }
    async deleteCredential(key) {
        return await keytar_1.default.deletePassword(this.serviceName, key);
    }
    async getAllCredentials() {
        return await keytar_1.default.findCredentials(this.serviceName);
    }
}
exports.CredentialManager = CredentialManager;
//# sourceMappingURL=CredentialManager.js.map