import * as fs from 'fs';
import * as path from 'path';
import { StatePattern } from '@/analysis/patterns';

export interface PluginDefinition {
  name: string;
  patterns: { regex: string; flags?: string; type: string }[];
  label?: string;
}

export interface UserConfig {
  exclude?: string[];
  threshold?: string;
  format?: string;
  plugins?: PluginDefinition[];
}

const CONFIG_FILES = ['.stateanalyzerrc.json', '.stateanalyzerrc', 'stateanalyzer.config.json'];

export function loadConfig(cwd: string = process.cwd()): UserConfig {
  for (const fileName of CONFIG_FILES) {
    const filePath = path.join(cwd, fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as UserConfig;
    }
  }
  return {};
}

export function resolvePluginPatterns(plugins: PluginDefinition[]): StatePattern[] {
  const patterns: StatePattern[] = [];
  for (const plugin of plugins) {
    for (const p of plugin.patterns) {
      patterns.push({
        regex: new RegExp(p.regex, p.flags || 'g'),
        type: p.type as StatePattern['type'],
      });
    }
  }
  return patterns;
}

export function resolvePluginLabels(plugins: PluginDefinition[]): Record<string, string> {
  const labels: Record<string, string> = {};
  for (const plugin of plugins) {
    for (const p of plugin.patterns) {
      if (plugin.label) {
        labels[p.type] = plugin.label;
      }
    }
  }
  return labels;
}
