import { AnalysisResult } from '@/types';

export function generateMermaid(result: AnalysisResult): string {
  const lines: string[] = [];
  lines.push('graph LR');

  const componentsWithState = result.components.filter((c) => c.stateUsages.length > 0);

  // Collect unique state types used
  const usedTypes = new Set<string>();
  for (const comp of componentsWithState) {
    for (const usage of comp.stateUsages) {
      usedTypes.add(usage.type);
    }
  }

  // Define state library nodes
  for (const type of usedTypes) {
    const id = sanitizeId(type);
    lines.push(`  ${id}[("${type}")]`);
  }

  // Define component nodes and edges
  for (const comp of componentsWithState) {
    const compId = sanitizeId(comp.name);
    const grade = comp.complexity?.grade || '?';
    lines.push(`  ${compId}["${comp.name} (${grade})"]`);

    // Group usages by type to avoid duplicate edges
    const typeSet = new Set(comp.stateUsages.map((u) => u.type));
    for (const type of typeSet) {
      const count = comp.stateUsages.filter((u) => u.type === type).length;
      const typeId = sanitizeId(type);
      lines.push(`  ${compId} -->|${count}| ${typeId}`);
    }
  }

  // Style grade nodes
  const gradeStyles: Record<string, string> = {
    A: 'fill:#4caf50,color:#fff',
    B: 'fill:#2196f3,color:#fff',
    C: 'fill:#ff9800,color:#fff',
    D: 'fill:#f44336,color:#fff',
    F: 'fill:#9c27b0,color:#fff',
  };

  for (const comp of componentsWithState) {
    const grade = comp.complexity?.grade;
    if (grade && gradeStyles[grade]) {
      lines.push(`  style ${sanitizeId(comp.name)} ${gradeStyles[grade]}`);
    }
  }

  return lines.join('\n');
}

function sanitizeId(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '_');
}
