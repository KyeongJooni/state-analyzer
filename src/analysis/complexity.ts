import { ComponentInfo, ComponentComplexity, ComplexityGrade, ProjectComplexity } from '../types';

export function computeComplexity(comp: ComponentInfo): ComponentComplexity {
  const stateCount = comp.stateUsages.length;
  const uniqueTypes = new Set(comp.stateUsages.map((u) => u.type));
  const typeDiversity = uniqueTypes.size;
  const hasMultipleLibraries = typeDiversity >= 3;

  let score = stateCount * 2 + typeDiversity * 3;
  if (hasMultipleLibraries) score += 5;

  return {
    score,
    grade: scoreToGrade(score),
    stateCount,
    typeDiversity,
    hasMultipleLibraries,
  };
}

export function computeProjectComplexity(components: ComponentInfo[]): ProjectComplexity {
  const withComplexity = components.filter((c) => c.complexity);
  const grades: Record<ComplexityGrade, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };

  if (withComplexity.length === 0) {
    return { averageScore: 0, grade: 'A', componentGrades: grades };
  }

  let totalScore = 0;
  for (const comp of withComplexity) {
    totalScore += comp.complexity!.score;
    grades[comp.complexity!.grade]++;
  }

  const averageScore = totalScore / withComplexity.length;
  return { averageScore, grade: scoreToGrade(averageScore), componentGrades: grades };
}

function scoreToGrade(score: number): ComplexityGrade {
  if (score <= 5) return 'A';
  if (score <= 10) return 'B';
  if (score <= 18) return 'C';
  if (score <= 28) return 'D';
  return 'F';
}
