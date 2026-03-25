import { AnalysisResult } from '@/types';

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
};

export function generateMarkdown(result: AnalysisResult): string {
  const lines: string[] = [];
  const componentsWithState = result.components.filter((c) => c.stateUsages.length > 0);
  const percentage =
    result.summary.totalComponents > 0
      ? ((componentsWithState.length / result.summary.totalComponents) * 100).toFixed(1)
      : '0';
  const grade = result.summary.complexity?.grade || '-';

  lines.push('## State Analysis Report');
  lines.push('');
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total components | ${result.summary.totalComponents} |`);
  lines.push(`| Components with state | ${componentsWithState.length} (${percentage}%) |`);
  lines.push(`| Total state usages | ${result.summary.totalStateUsages} |`);
  lines.push(`| Project complexity | **${grade}** |`);
  if (result.customHooks.length > 0) {
    lines.push(`| Custom hooks | ${result.customHooks.length} |`);
  }
  lines.push('');

  // Usage by type
  if (Object.keys(result.summary.byType).length > 0) {
    lines.push('### Usage by type');
    lines.push('');
    lines.push('| Type | Count |');
    lines.push('|------|-------|');
    for (const [type, count] of Object.entries(result.summary.byType)) {
      lines.push(`| ${TYPE_LABELS[type] || type} | ${count} |`);
    }
    lines.push('');
  }

  // Top components
  const sorted = [...componentsWithState]
    .sort((a, b) => b.stateUsages.length - a.stateUsages.length)
    .slice(0, 10);

  if (sorted.length > 0) {
    lines.push('### Top components');
    lines.push('');
    lines.push('| # | Component | Grade | States | File |');
    lines.push('|---|-----------|-------|--------|------|');
    sorted.forEach((comp, i) => {
      const g = comp.complexity?.grade || '-';
      lines.push(
        `| ${i + 1} | ${comp.name} | ${g} | ${comp.stateUsages.length} | ${comp.file} |`,
      );
    });
    lines.push('');
  }

  // Suggestions
  if (result.suggestions.length > 0) {
    lines.push('### Suggestions');
    lines.push('');
    for (const s of result.suggestions) {
      const icon = s.type === 'warning' ? '⚠️' : s.type === 'improvement' ? '💡' : 'ℹ️';
      lines.push(`- ${icon} **${s.component}** — ${s.message}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
