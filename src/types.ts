export type StateType =
  | 'useState'
  | 'useContext'
  | 'useReducer'
  | 'zustand'
  | 'jotai'
  | 'redux'
  | 'mobx'
  | 'recoil'
  | 'valtio'
  | 'tanstack-query'
  | 'swr';

export type ComplexityGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface StateUsage {
  type: StateType;
  name: string;
  file: string;
  line: number;
  component: string;
}

export interface ComponentComplexity {
  score: number;
  grade: ComplexityGrade;
  stateCount: number;
  typeDiversity: number;
  hasMultipleLibraries: boolean;
}

export interface ComponentInfo {
  name: string;
  file: string;
  stateUsages: StateUsage[];
  children: string[];
  complexity?: ComponentComplexity;
}

export interface CustomHookInfo {
  name: string;
  file: string;
  internalStateUsages: StateUsage[];
}

export interface ProjectComplexity {
  averageScore: number;
  grade: ComplexityGrade;
  componentGrades: Record<ComplexityGrade, number>;
}

export interface AnalysisResult {
  summary: {
    totalComponents: number;
    totalStateUsages: number;
    byType: Record<string, number>;
    complexity?: ProjectComplexity;
  };
  components: ComponentInfo[];
  customHooks: CustomHookInfo[];
  suggestions: Suggestion[];
}

export type SuggestionType = 'warning' | 'info' | 'improvement';

export interface Suggestion {
  type: SuggestionType;
  message: string;
  file: string;
  component: string;
}
