import fs from 'fs-extra';
import path from 'path';
import { ModrinthConfig } from './types';

const CONFIG_FILE = '.modrinth.json';

export class ConfigManager {
  private configPath: string;
  private config: ModrinthConfig | null = null;

  constructor(projectPath: string) {
    this.configPath = path.join(projectPath, CONFIG_FILE);
  }

  async loadConfig(): Promise<ModrinthConfig | null> {
    if (this.config) {
      return this.config;
    }

    try {
      if (await fs.pathExists(this.configPath)) {
        this.config = await fs.readJson(this.configPath);
        return this.config;
      }
    } catch (error) {
      console.error('Error loading config:', error);
    }

    return null;
  }

  async saveConfig(config: ModrinthConfig): Promise<void> {
    try {
      await fs.writeJson(this.configPath, config, { spaces: 2 });
      this.config = config;
    } catch (error) {
      throw new Error(`Failed to save config: ${error}`);
    }
  }

  async createConfig(projectPath: string): Promise<ModrinthConfig> {
    const config: ModrinthConfig = {
      version: '',
      type: 'mod',
      loader: 'fabric',
      minecraftVersion: '',
      modsFolder: 'mods',
      pluginsFolder: 'plugins'
    };

    await this.saveConfig(config);
    return config;
  }

  async updateConfig(updates: Partial<ModrinthConfig>): Promise<void> {
    const currentConfig = await this.loadConfig();
    if (!currentConfig) {
      throw new Error('No config found. Run init first.');
    }

    const updatedConfig = { ...currentConfig, ...updates };
    await this.saveConfig(updatedConfig);
  }

  async getConfig(): Promise<ModrinthConfig> {
    const config = await this.loadConfig();
    if (!config) {
      throw new Error('No config found. Run init first.');
    }
    return config;
  }

  async validateFolders(projectPath: string): Promise<{ mods: boolean; plugins: boolean }> {
    const config = await this.getConfig();
    const modsPath = path.join(projectPath, config.modsFolder || 'mods');
    const pluginsPath = path.join(projectPath, config.pluginsFolder || 'plugins');

    return {
      mods: await fs.pathExists(modsPath),
      plugins: await fs.pathExists(pluginsPath)
    };
  }

  async ensureFolders(projectPath: string): Promise<void> {
    const config = await this.getConfig();
    const modsPath = path.join(projectPath, config.modsFolder || 'mods');
    const pluginsPath = path.join(projectPath, config.pluginsFolder || 'plugins');

    if (config.type === 'mod') {
      await fs.ensureDir(modsPath);
    } else if (config.type === 'plugin') {
      await fs.ensureDir(pluginsPath);
    }
  }
}
