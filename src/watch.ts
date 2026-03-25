import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import { StateAnalyzer } from '@/analyzer';
import { UserConfig } from '@/config';

export function startWatch(targetPath: string, config: UserConfig): void {
  const absolutePath = path.resolve(targetPath);
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const runAnalysis = () => {
    console.clear();
    console.log(chalk.blue(`\n[${new Date().toLocaleTimeString()}] Re-analyzing...\n`));

    const analyzer = new StateAnalyzer(config);
    const result = analyzer.analyze(targetPath);

    const componentsWithState = result.components.filter((c) => c.stateUsages.length > 0).length;
    const grade = result.summary.complexity?.grade || '-';

    console.log(
      `Components: ${chalk.cyan(result.summary.totalComponents)}  |  ` +
        `With state: ${chalk.cyan(componentsWithState)}  |  ` +
        `Usages: ${chalk.cyan(result.summary.totalStateUsages)}  |  ` +
        `Grade: ${chalk.bold(grade)}`,
    );

    if (result.suggestions.length > 0) {
      console.log(chalk.yellow(`\n${result.suggestions.length} suggestion(s)`));
    }

    console.log(chalk.gray('\nWatching for changes... (Ctrl+C to stop)'));
  };

  runAnalysis();

  fs.watch(absolutePath, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    if (!/\.(tsx?|jsx?)$/.test(filename)) return;
    if (/node_modules|dist|build|\.test\.|\.spec\./.test(filename)) return;

    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(runAnalysis, 300);
  });
}
