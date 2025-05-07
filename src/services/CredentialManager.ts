import keytar from 'keytar';

export class CredentialManager {
  serviceName: string;

  constructor(serviceName = 'HeadlessPilot') {
    this.serviceName = serviceName;
  }

  async saveCredential(key: string, value: string) {
    return await keytar.setPassword(this.serviceName, key, value);
  }

  async getCredential(key: string) {
    return await keytar.getPassword(this.serviceName, key);
  }

  async deleteCredential(key: string) {
    return await keytar.deletePassword(this.serviceName, key);
  }

  async getAllCredentials() {
    return await keytar.findCredentials(this.serviceName);
  }
} 