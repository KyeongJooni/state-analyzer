#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { StateAnalyzer } from '@/analyzer';
import {
  AnalysisResult,
  ComponentInfo,
  CustomHookInfo,
  ComplexityGrade,
  Suggestion,
} from '@/types';
import { loadAnalysisResult, computeDiff, printDiff } from '@/output/diff';
import { generateMarkdown } from '@/output/markdown';
import { generateMermaid } from '@/output/mermaid';
import { loadConfig, resolvePluginLabels } from '@/config';
import { startWatch } from '@/watch';
import { initConfig } from '@/init';

const config = loadConfig();
const pluginLabels = config.plugins ? resolvePluginLabels(config.plugins) : {};

const program = new Command();

program
  .name('state-analyzer')
  .description('Analyze Frontend state management patterns')
  .version('0.6.0');

program
  .command('analyze')
  .description('Analyze React code in the specified path')
  .argument('<path>', 'Directory path to analyze')
  .option('-o, --output <file>', 'Output file path for JSON results')
  .option('-v, --verbose', 'Verbose output')
  .option('-t, --threshold <grade>', 'Fail if project complexity exceeds grade (A/B/C/D/F)')
  .option('-f, --format <type>', 'Output format: default, md')
  .option('--mermaid', 'Output Mermaid diagram of component-state dependencies')
  .action(
    (
      targetPath: string,
      options: {
        output?: string;
        verbose?: boolean;
        threshold?: string;
        format?: string;
        mermaid?: boolean;
      },
    ) => {
      console.log(chalk.blue('\nStarting state analysis...\n'));

      const analyzer = new StateAnalyzer(config);
      const result = analyzer.analyze(targetPath);

      if (options.format === 'md') {
        console.log(generateMarkdown(result));
      } else if (options.mermaid) {
        console.log(generateMermaid(result));
      } else {
        printSummary(result);
        printComplexity(result);
        printTopComponents(result);

        if (result.customHooks.length > 0) {
          printCustomHooks(result.customHooks);
        }

        if (result.suggestions.length > 0) {
          printSuggestions(result.suggestions);
        }

        if (options.verbose) {
          printDetails(result);
        }
      }

      if (options.output) {
        saveResult(result, options.output);
      }

      if (options.threshold) {
        const exitCode = checkThreshold(result, options.threshold);
        process.exit(exitCode);
      }
    },
  );

program
  .command('diff')
  .description('Compare two analysis results')
  .argument('<before>', 'Path to previous analysis JSON')
  .argument('<after>', 'Path to current analysis JSON')
  .action((beforePath: string, afterPath: string) => {
    const before = loadAnalysisResult(beforePath);
    const after = loadAnalysisResult(afterPath);
    const diff = computeDiff(before, after);
    printDiff(diff);
  });

program
  .command('init')
  .description('Create a .stateanalyzerrc.json config file')
  .action(() => {
    initConfig();
  });

program
  .command('watch')
  .description('Watch for file changes and re-analyze')
  .argument('<path>', 'Directory path to watch')
  .action((targetPath: string) => {
    startWatch(targetPath, config);
  });

const TYPE_LABELS: Record<string, string> = {
  useState: 'useState',
  useContext: 'useContext',
  useReducer: 'useReducer',
  zustand: 'Zustand',
  jotai: 'Jotai',
  redux: 'Redux',
  mobx: 'MobX',
  recoil: 'Recoil',
  valtio: 'Valtio',
  'tanstack-query': 'TanStack Query',
  swr: 'SWR',
  ...pluginLabels,
};

const GRADE_COLORS: Record<ComplexityGrade, (text: string) => string> = {
  A: chalk.green,
  B: chalk.cyan,
  C: chalk.yellow,
  D: chalk.hex('#FFA500'),
  F: chalk.red,
};

const GRADE_ORDER: ComplexityGrade[] = ['A', 'B', 'C', 'D', 'F'];

function printSummary(result: AnalysisResult): void {
  console.log(chalk.bold('=== Analysis Summary ===\n'));

  const componentsWithState = result.components.filter((c) => c.stateUsages.length > 0).length;
  const percentage =
    result.summary.totalComponents > 0
      ? ((componentsWithState / result.summary.totalComponents) * 100).toFixed(1)
      : '0';

  console.log(`Total components: ${chalk.cyan(result.summary.totalComponents)}`);
  console.log(`Components with state: ${chalk.cyan(componentsWithState)} (${percentage}%)`);
  console.log(`Total state usage: ${chalk.cyan(result.summary.totalStateUsages)}`);

  const average =
    componentsWithState > 0
      ? (result.summary.totalStateUsages / componentsWithState).toFixed(1)
      : '0';
  console.log(`Average: ${chalk.cyan(average)} states/component`);

  if (result.customHooks.length > 0) {
    console.log(`Custom hooks: ${chalk.cyan(result.customHooks.length)}`);
  }

  const clientComps = result.components.filter((c) => c.environment === 'client').length;
  const serverComps = result.components.filter((c) => c.environment === 'server').length;
  if (clientComps > 0 || serverComps > 0) {
    console.log(
      `Environment: ${chalk.cyan(clientComps)} client / ${chalk.cyan(serverComps)} server`,
    );
  }
  console.log('');

  console.log('Usage by type:');
  for (const [type, count] of Object.entries(result.summary.byType)) {
    const label = TYPE_LABELS[type] || type;
    console.log(`  ${label}: ${chalk.yellow(count)}`);
  }
  console.log('');

  console.log('State distribution:');
  const distribution = calculateDistribution(result.components);
  for (const [range, count] of Object.entries(distribution)) {
    const bar = '█'.repeat(Math.min(count, 20));
    console.log(`  ${range.padEnd(12)} ${chalk.cyan(bar)} ${chalk.gray(`(${count})`)}`);
  }
  console.log('');
}

function printComplexity(result: AnalysisResult): void {
  const complexity = result.summary.complexity;
  if (!complexity) return;

  console.log(chalk.bold('=== Complexity ===\n'));

  const colorFn = GRADE_COLORS[complexity.grade];
  console.log(
    `Project grade: ${colorFn(chalk.bold(complexity.grade))} (score: ${complexity.averageScore.toFixed(1)})`,
  );
  console.log('');

  console.log('Component grades:');
  for (const grade of GRADE_ORDER) {
    const count = complexity.componentGrades[grade];
    if (count === 0) continue;
    const bar = '█'.repeat(Math.min(count, 20));
    console.log(`  ${GRADE_COLORS[grade](grade)} ${chalk.cyan(bar)} ${chalk.gray(`(${count})`)}`);
  }
  console.log('');
}

function calculateDistribution(components: ComponentInfo[]): Record<string, number> {
  const dist: Record<string, number> = {
    '1-2 states': 0,
    '3-5 states': 0,
    '6-10 states': 0,
    '11+ states': 0,
  };

  for (const comp of components) {
    const count = comp.stateUsages.length;
    if (count === 0) continue;
    if (count <= 2) dist['1-2 states']++;
    else if (count <= 5) dist['3-5 states']++;
    else if (count <= 10) dist['6-10 states']++;
    else dist['11+ states']++;
  }

  return dist;
}

function printDetails(result: AnalysisResult): void {
  console.log(chalk.bold('=== Component Details ===\n'));

  for (const comp of result.components) {
    if (comp.stateUsages.length === 0) continue;

    const gradeStr = comp.complexity
      ? ` [${GRADE_COLORS[comp.complexity.grade](comp.complexity.grade)}]`
      : '';
    console.log(chalk.green(`${comp.name}`) + gradeStr, chalk.gray(`(${comp.file})`));
    for (const usage of comp.stateUsages) {
      const label = TYPE_LABELS[usage.type] || usage.type;
      console.log(`  - ${label}: ${chalk.gray(`line ${usage.line}`)}`);
    }
    console.log('');
  }
}

function printCustomHooks(hooks: CustomHookInfo[]): void {
  console.log(chalk.bold('=== Custom Hooks ===\n'));

  for (const hook of hooks) {
    const typeCounts: Record<string, number> = {};
    hook.internalStateUsages.forEach((u) => {
      typeCounts[u.type] = (typeCounts[u.type] || 0) + 1;
    });

    const summary = Object.entries(typeCounts)
      .map(([type, count]) => `${TYPE_LABELS[type] || type}(${count})`)
      .join(', ');

    console.log(
      `  ${chalk.magenta(hook.name)} ${chalk.gray(`(${hook.file})`)} — ${chalk.yellow(summary)}`,
    );
  }
  console.log('');
}

function printSuggestions(suggestions: Suggestion[]): void {
  console.log(chalk.bold('=== Suggestions ===\n'));

  const icons: Record<string, string> = {
    warning: chalk.yellow('!'),
    info: chalk.blue('i'),
    improvement: chalk.green('*'),
  };

  for (const s of suggestions) {
    const icon = icons[s.type] || '-';
    console.log(`  ${icon} ${chalk.white(s.component)} ${chalk.gray(`(${s.file})`)}`);
    console.log(`    ${s.message}`);
  }
  console.log('');
}

function printTopComponents(result: AnalysisResult): void {
  console.log(chalk.bold('=== Top 10 Components ===\n'));

  const sorted = [...result.components]
    .filter((c) => c.stateUsages.length > 0)
    .sort((a, b) => b.stateUsages.length - a.stateUsages.length)
    .slice(0, 10);

  if (sorted.length === 0) {
    console.log(chalk.gray('No components with state found.\n'));
    return;
  }

  sorted.forEach((comp, index) => {
    const patternCounts: Record<string, number> = {};
    comp.stateUsages.forEach((usage) => {
      patternCounts[usage.type] = (patternCounts[usage.type] || 0) + 1;
    });

    const patterns = Object.entries(patternCounts)
      .map(([type, count]) => `${TYPE_LABELS[type] || type}(${count})`)
      .join(', ');

    const gradeStr = comp.complexity
      ? ` ${GRADE_COLORS[comp.complexity.grade](comp.complexity.grade)}`
      : '';

    console.log(
      `${chalk.cyan((index + 1).toString().padStart(2))}. ${chalk.green(comp.name)}${gradeStr} ${chalk.gray(`(${comp.stateUsages.length} states)`)} - ${chalk.gray(comp.file)}`,
    );
    console.log(`    ${chalk.yellow(patterns)}\n`);
  });
}

function checkThreshold(result: AnalysisResult, threshold: string): number {
  const grade = threshold.toUpperCase() as ComplexityGrade;
  if (!GRADE_ORDER.includes(grade)) {
    console.log(chalk.red(`Invalid threshold grade: ${threshold}. Use A, B, C, D, or F.\n`));
    return 1;
  }

  const projectGrade = result.summary.complexity?.grade || 'A';
  const projectIdx = GRADE_ORDER.indexOf(projectGrade);
  const thresholdIdx = GRADE_ORDER.indexOf(grade);

  if (projectIdx > thresholdIdx) {
    console.log(
      chalk.red(
        `Threshold check failed: project grade ${projectGrade} exceeds threshold ${grade}\n`,
      ),
    );
    return 1;
  }

  console.log(
    chalk.green(`Threshold check passed: project grade ${projectGrade} within ${grade}\n`),
  );
  return 0;
}

function saveResult(result: AnalysisResult, outputPath: string): void {
  const absolutePath = path.resolve(outputPath);
  fs.writeFileSync(absolutePath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(chalk.green(`Results saved to ${absolutePath}\n`));
}

program.parse();
