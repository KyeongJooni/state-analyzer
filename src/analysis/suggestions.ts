import { SourceFile, SyntaxKind } from 'ts-morph';
import * as path from 'path';
import { ComponentInfo, Suggestion } from '@/types';
import { USE_STATE_DESTRUCTURE, USE_REDUCER_DESTRUCTURE } from '@/analysis/patterns';

const SKIP_FILE_PATTERN =
  /(styled|styles|constants|types|utils|helpers|config|api|services)\.tsx?$/;

export function detectUnusedState(sourceFile: SourceFile): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const filePath = sourceFile.getFilePath();
  const relativePath = path.relative(process.cwd(), filePath);
  const fileName = path.basename(filePath);

  if (SKIP_FILE_PATTERN.test(fileName)) return [];

  const analyzeBody = (body: string, componentName: string) => {
    for (const regex of [USE_STATE_DESTRUCTURE, USE_REDUCER_DESTRUCTURE]) {
      regex.lastIndex = 0;
      let match;
      while ((match = regex.exec(body)) !== null) {
        const varName = match[1];
        const afterDeclaration = body.slice(match.index + match[0].length);
        const usageRegex = new RegExp(`\\b${varName}\\b`, 'g');
        const usages = afterDeclaration.match(usageRegex);
        if (!usages || usages.length === 0) {
          suggestions.push({
            type: 'warning',
            message: `'${varName}' is declared via state hook but never used`,
            file: relativePath,
            component: componentName,
          });
        }
      }
    }
  };

  for (const func of sourceFile.getFunctions()) {
    const name = func.getName();
    if (name && /^[A-Z]/.test(name)) {
      analyzeBody(func.getBody()?.getText() || '', name);
    }
  }

  for (const varDecl of sourceFile.getVariableDeclarations()) {
    const name = varDecl.getName();
    if (/^[A-Z]/.test(name)) {
      const initializer = varDecl.getInitializer();
      if (initializer) {
        const kind = initializer.getKind();
        if (kind === SyntaxKind.ArrowFunction || kind === SyntaxKind.CallExpression) {
          analyzeBody(initializer.getText(), name);
        }
      }
    }
  }

  return suggestions;
}

export function detectRerenderRisks(comp: ComponentInfo): Suggestion[] {
  const suggestions: Suggestion[] = [];

  if (comp.stateUsages.length >= 6) {
    suggestions.push({
      type: 'warning',
      message: `${comp.stateUsages.length} state hooks detected — consider grouping related state with useReducer or extracting to a custom hook`,
      file: comp.file,
      component: comp.name,
    });
  }

  const uniqueTypes = new Set(comp.stateUsages.map((u) => u.type));
  if (uniqueTypes.size >= 3) {
    const libs = [...uniqueTypes].join(', ');
    suggestions.push({
      type: 'warning',
      message: `Mixing ${uniqueTypes.size} state management types (${libs}) — may cause unnecessary re-renders and increases complexity`,
      file: comp.file,
      component: comp.name,
    });
  }

  const contextCount = comp.stateUsages.filter((u) => u.type === 'useContext').length;
  if (contextCount >= 3) {
    suggestions.push({
      type: 'improvement',
      message: `${contextCount} useContext calls — consider combining contexts or switching to a state library`,
      file: comp.file,
      component: comp.name,
    });
  }

  return suggestions;
}
