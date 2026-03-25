import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { AnalysisResult } from '@/types';

export interface DiffResult {
  components: {
    added: string[];
    removed: string[];
    changed: { name: string; before: number; after: number }[];
  };
  summary: {
    totalComponentsDelta: number;
    totalStateUsagesDelta: number;
    gradeBefore?: string;
    gradeAfter?: string;
  };
  byType: { type: string; before: number; after: number; delta: number }[];
}

export function loadAnalysisResult(filePath: string): AnalysisResult {
  const absolutePath = path.resolve(filePath);
  const content = fs.readFileSync(absolutePath, 'utf-8');
  return JSON.parse(content) as AnalysisResult;
}

export function computeDiff(before: AnalysisResult, after: AnalysisResult): DiffResult {
  const beforeNames = new Set(before.components.map((c) => c.name));
  const afterNames = new Set(after.components.map((c) => c.name));

  const added = [...afterNames].filter((n) => !beforeNames.has(n));
  const removed = [...beforeNames].filter((n) => !afterNames.has(n));

  const changed: { name: string; before: number; after: number }[] = [];
  for (const name of afterNames) {
    if (!beforeNames.has(name)) continue;
    const bComp = before.components.find((c) => c.name === name)!;
    const aComp = after.components.find((c) => c.name === name)!;
    if (bComp.stateUsages.length !== aComp.stateUsages.length) {
      changed.push({ name, before: bComp.stateUsages.length, after: aComp.stateUsages.length });
    }
  }

  const allTypes = new Set([
    ...Object.keys(before.summary.byType),
    ...Object.keys(after.summary.byType),
  ]);
  const byType = [...allTypes].map((type) => {
    const b = before.summary.byType[type] || 0;
    const a = after.summary.byType[type] || 0;
    return { type, before: b, after: a, delta: a - b };
  });

  return {
    components: { added, removed, changed },
    summary: {
      totalComponentsDelta: after.summary.totalComponents - before.summary.totalComponents,
      totalStateUsagesDelta: after.summary.totalStateUsages - before.summary.totalStateUsages,
      gradeBefore: before.summary.complexity?.grade,
      gradeAfter: after.summary.complexity?.grade,
    },
    byType,
  };
}

function formatDelta(delta: number): string {
  if (delta > 0) return chalk.red(`+${delta}`);
  if (delta < 0) return chalk.green(`${delta}`);
  return chalk.gray('0');
}

export function printDiff(diff: DiffResult): void {
  console.log(chalk.bold('\n=== Diff Summary ===\n'));

  console.log(
    `Components: ${formatDelta(diff.summary.totalComponentsDelta)}  |  State usages: ${formatDelta(diff.summary.totalStateUsagesDelta)}`,
  );

  if (diff.summary.gradeBefore && diff.summary.gradeAfter) {
    const changed = diff.summary.gradeBefore !== diff.summary.gradeAfter;
    const arrow = changed ? chalk.yellow('→') : chalk.gray('→');
    console.log(
      `Complexity: ${diff.summary.gradeBefore} ${arrow} ${diff.summary.gradeAfter}`,
    );
  }
  console.log('');

  if (diff.byType.some((t) => t.delta !== 0)) {
    console.log(chalk.bold('By type:'));
    for (const t of diff.byType) {
      if (t.delta === 0) continue;
      console.log(`  ${t.type}: ${t.before} → ${t.after} (${formatDelta(t.delta)})`);
    }
    console.log('');
  }

  if (diff.components.added.length > 0) {
    console.log(chalk.bold('Added components:'));
    diff.components.added.forEach((n) => console.log(`  ${chalk.green('+')} ${n}`));
    console.log('');
  }

  if (diff.components.removed.length > 0) {
    console.log(chalk.bold('Removed components:'));
    diff.components.removed.forEach((n) => console.log(`  ${chalk.red('-')} ${n}`));
    console.log('');
  }

  if (diff.components.changed.length > 0) {
    console.log(chalk.bold('Changed components:'));
    for (const c of diff.components.changed) {
      console.log(`  ${chalk.yellow('~')} ${c.name}: ${c.before} → ${c.after} states (${formatDelta(c.after - c.before)})`);
    }
    console.log('');
  }
}
