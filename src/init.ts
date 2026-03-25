import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';

const DEFAULT_CONFIG = {
  exclude: ['__tests__', 'stories', 'mocks'],
  threshold: 'C',
};

export function initConfig(cwd: string = process.cwd()): void {
  const filePath = path.join(cwd, '.stateanalyzerrc.json');

  if (fs.existsSync(filePath)) {
    console.log(chalk.yellow('\n.stateanalyzerrc.json already exists.\n'));
    return;
  }

  fs.writeFileSync(filePath, JSON.stringify(DEFAULT_CONFIG, null, 2) + '\n', 'utf-8');
  console.log(chalk.green('\nCreated .stateanalyzerrc.json\n'));
}
