import { describe, it, expect } from 'vitest';
import * as path from 'path';
import { StateAnalyzer } from '@/analyzer';
import { computeDiff } from '@/output/diff';
import { generateMarkdown } from '@/output/markdown';
import { generateMermaid } from '@/output/mermaid';
import { AnalysisResult } from '@/types';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

function getResult(): AnalysisResult {
  const analyzer = new StateAnalyzer();
  return analyzer.analyze(FIXTURES_DIR);
}

describe('diff mode', () => {
  it('should detect added components', () => {
    const before: AnalysisResult = {
      summary: { totalComponents: 1, totalStateUsages: 1, byType: { useState: 1 } },
      components: [{ name: 'Old', file: 'old.tsx', stateUsages: [{ type: 'useState', name: 'useState', file: 'old.tsx', line: 1, component: 'Old' }], children: [] }],
      customHooks: [],
      suggestions: [],
    };
    const after: AnalysisResult = {
      summary: { totalComponents: 2, totalStateUsages: 2, byType: { useState: 2 } },
      components: [
        ...before.components,
        { name: 'New', file: 'new.tsx', stateUsages: [{ type: 'useState', name: 'useState', file: 'new.tsx', line: 1, component: 'New' }], children: [] },
      ],
      customHooks: [],
      suggestions: [],
    };

    const diff = computeDiff(before, after);
    expect(diff.components.added).toContain('New');
    expect(diff.summary.totalComponentsDelta).toBe(1);
  });

  it('should detect removed components', () => {
    const before: AnalysisResult = {
      summary: { totalComponents: 1, totalStateUsages: 1, byType: { useState: 1 } },
      components: [{ name: 'Gone', file: 'gone.tsx', stateUsages: [{ type: 'useState', name: 'useState', file: 'gone.tsx', line: 1, component: 'Gone' }], children: [] }],
      customHooks: [],
      suggestions: [],
    };
    const after: AnalysisResult = {
      summary: { totalComponents: 0, totalStateUsages: 0, byType: {} },
      components: [],
      customHooks: [],
      suggestions: [],
    };

    const diff = computeDiff(before, after);
    expect(diff.components.removed).toContain('Gone');
  });

  it('should detect changed state count', () => {
    const comp = { name: 'App', file: 'app.tsx', children: [] as string[] };
    const before: AnalysisResult = {
      summary: { totalComponents: 1, totalStateUsages: 1, byType: { useState: 1 } },
      components: [{ ...comp, stateUsages: [{ type: 'useState' as const, name: 'useState', file: 'app.tsx', line: 1, component: 'App' }] }],
      customHooks: [],
      suggestions: [],
    };
    const after: AnalysisResult = {
      summary: { totalComponents: 1, totalStateUsages: 3, byType: { useState: 3 } },
      components: [{
        ...comp,
        stateUsages: [
          { type: 'useState' as const, name: 'useState', file: 'app.tsx', line: 1, component: 'App' },
          { type: 'useState' as const, name: 'useState', file: 'app.tsx', line: 2, component: 'App' },
          { type: 'useState' as const, name: 'useState', file: 'app.tsx', line: 3, component: 'App' },
        ],
      }],
      customHooks: [],
      suggestions: [],
    };

    const diff = computeDiff(before, after);
    expect(diff.components.changed).toHaveLength(1);
    expect(diff.components.changed[0].before).toBe(1);
    expect(diff.components.changed[0].after).toBe(3);
  });

  it('should track byType deltas', () => {
    const before: AnalysisResult = {
      summary: { totalComponents: 0, totalStateUsages: 5, byType: { useState: 3, redux: 2 } },
      components: [],
      customHooks: [],
      suggestions: [],
    };
    const after: AnalysisResult = {
      summary: { totalComponents: 0, totalStateUsages: 4, byType: { useState: 1, zustand: 3 } },
      components: [],
      customHooks: [],
      suggestions: [],
    };

    const diff = computeDiff(before, after);
    const useStateDiff = diff.byType.find((t) => t.type === 'useState');
    expect(useStateDiff?.delta).toBe(-2);
    const zustandDiff = diff.byType.find((t) => t.type === 'zustand');
    expect(zustandDiff?.delta).toBe(3);
  });
});

describe('markdown output', () => {
  it('should generate valid markdown with tables', () => {
    const result = getResult();
    const md = generateMarkdown(result);

    expect(md).toContain('## State Analysis Report');
    expect(md).toContain('| Metric | Value |');
    expect(md).toContain('Total components');
    expect(md).toContain('### Usage by type');
    expect(md).toContain('### Top components');
  });

  it('should include complexity grade', () => {
    const result = getResult();
    const md = generateMarkdown(result);
    expect(md).toMatch(/\*\*[A-F]\*\*/);
  });

  it('should include suggestions if present', () => {
    const result = getResult();
    if (result.suggestions.length > 0) {
      const md = generateMarkdown(result);
      expect(md).toContain('### Suggestions');
    }
  });
});

describe('mermaid output', () => {
  it('should generate valid mermaid graph', () => {
    const result = getResult();
    const mermaid = generateMermaid(result);

    expect(mermaid).toContain('graph LR');
    expect(mermaid).toContain('-->');
  });

  it('should include component nodes with grades', () => {
    const result = getResult();
    const mermaid = generateMermaid(result);

    const componentWithGrade = result.components.find((c) => c.complexity);
    if (componentWithGrade) {
      expect(mermaid).toContain(componentWithGrade.name);
      expect(mermaid).toContain(componentWithGrade.complexity!.grade);
    }
  });

  it('should include style directives for grades', () => {
    const result = getResult();
    const mermaid = generateMermaid(result);
    expect(mermaid).toContain('style');
    expect(mermaid).toContain('fill:');
  });
});
