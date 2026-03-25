import { Project, SourceFile, SyntaxKind } from 'ts-morph';
import * as path from 'path';
import { StateUsage, ComponentInfo, CustomHookInfo, AnalysisResult, Suggestion } from '@/types';
import { STATE_PATTERNS, StatePattern } from '@/analysis/patterns';
import { computeComplexity, computeProjectComplexity } from '@/analysis/complexity';
import { detectUnusedState, detectRerenderRisks } from '@/analysis/suggestions';
import { UserConfig, resolvePluginPatterns } from '@/config';

const SKIP_FILE_PATTERN =
  /(styled|styles|constants|types|utils|helpers|config|api|services)\.tsx?$/;

export class StateAnalyzer {
  private project: Project;
  private patterns: StatePattern[];
  private excludePatterns: RegExp[];

  constructor(config: UserConfig = {}) {
    this.project = new Project({
      skipAddingFilesFromTsConfig: true,
    });

    this.patterns = [...STATE_PATTERNS];
    if (config.plugins) {
      this.patterns.push(...resolvePluginPatterns(config.plugins));
    }

    this.excludePatterns = (config.exclude || []).map((p) => new RegExp(p));
  }

  analyze(targetPath: string): AnalysisResult {
    const absolutePath = path.resolve(targetPath).replace(/\\/g, '/');

    this.project.addSourceFilesAtPaths([
      `${absolutePath}/**/*.tsx`,
      `${absolutePath}/**/*.ts`,
      `!${absolutePath}/**/node_modules/**`,
      `!${absolutePath}/**/*.test.*`,
      `!${absolutePath}/**/*.spec.*`,
      `!${absolutePath}/**/*.d.ts`,
      `!${absolutePath}/**/*.config.*`,
      `!${absolutePath}/**/dist/**`,
      `!${absolutePath}/**/build/**`,
    ]);

    const sourceFiles = this.project.getSourceFiles();
    const components: ComponentInfo[] = [];
    const customHooks: CustomHookInfo[] = [];
    const allUsages: StateUsage[] = [];
    const suggestions: Suggestion[] = [];

    for (const sourceFile of sourceFiles) {
      const fileComponents = this.analyzeFile(sourceFile);
      components.push(...fileComponents);
      fileComponents.forEach((comp) => allUsages.push(...comp.stateUsages));

      customHooks.push(...this.analyzeCustomHooks(sourceFile));
      suggestions.push(...detectUnusedState(sourceFile));
    }

    for (const comp of components) {
      comp.complexity = computeComplexity(comp);
      suggestions.push(...detectRerenderRisks(comp));
    }

    return {
      summary: {
        totalComponents: components.length,
        totalStateUsages: allUsages.length,
        byType: this.countByType(allUsages),
        complexity: computeProjectComplexity(components),
      },
      components,
      customHooks,
      suggestions,
    };
  }

  private analyzeFile(sourceFile: SourceFile): ComponentInfo[] {
    const components: ComponentInfo[] = [];
    const filePath = sourceFile.getFilePath();
    const relativePath = path.relative(process.cwd(), filePath);

    if (SKIP_FILE_PATTERN.test(path.basename(filePath))) return [];
    if (this.excludePatterns.some((p) => p.test(relativePath))) return [];

    for (const func of sourceFile.getFunctions()) {
      const name = func.getName();
      if (name && this.isComponentName(name)) {
        const stateUsages = this.findStateUsages(
          func.getBody()?.getText() || '',
          relativePath,
          name,
        );
        if (stateUsages.length > 0 || this.hasJsxReturn(func.getText())) {
          components.push({ name, file: relativePath, stateUsages, children: [] });
        }
      }
    }

    for (const varDecl of sourceFile.getVariableDeclarations()) {
      const name = varDecl.getName();
      if (this.isComponentName(name)) {
        const initializer = varDecl.getInitializer();
        if (initializer) {
          const kind = initializer.getKind();
          if (kind === SyntaxKind.ArrowFunction || kind === SyntaxKind.CallExpression) {
            const text = initializer.getText();
            const stateUsages = this.findStateUsages(text, relativePath, name);
            if (stateUsages.length > 0 || this.hasJsxReturn(text)) {
              components.push({ name, file: relativePath, stateUsages, children: [] });
            }
          }
        }
      }
    }

    return components;
  }

  private analyzeCustomHooks(sourceFile: SourceFile): CustomHookInfo[] {
    const hooks: CustomHookInfo[] = [];
    const filePath = sourceFile.getFilePath();
    const relativePath = path.relative(process.cwd(), filePath);

    for (const func of sourceFile.getFunctions()) {
      const name = func.getName();
      if (name && this.isCustomHookName(name)) {
        const internalStateUsages = this.findStateUsages(
          func.getBody()?.getText() || '',
          relativePath,
          name,
        );
        if (internalStateUsages.length > 0) {
          hooks.push({ name, file: relativePath, internalStateUsages });
        }
      }
    }

    for (const varDecl of sourceFile.getVariableDeclarations()) {
      const name = varDecl.getName();
      if (this.isCustomHookName(name)) {
        const initializer = varDecl.getInitializer();
        if (initializer && initializer.getKind() === SyntaxKind.ArrowFunction) {
          const internalStateUsages = this.findStateUsages(
            initializer.getText(),
            relativePath,
            name,
          );
          if (internalStateUsages.length > 0) {
            hooks.push({ name, file: relativePath, internalStateUsages });
          }
        }
      }
    }

    return hooks;
  }

  private findStateUsages(code: string, file: string, component: string): StateUsage[] {
    const usages: StateUsage[] = [];
    const lines = code.split('\n');

    lines.forEach((line, index) => {
      for (const pattern of this.patterns) {
        pattern.regex.lastIndex = 0;
        const matches = line.match(pattern.regex);
        if (matches) {
          matches.forEach((match) => {
            usages.push({
              type: pattern.type,
              name: match.replace(/\s*[<(]/, ''),
              file,
              line: index + 1,
              component,
            });
          });
        }
      }
    });

    return usages;
  }

  private isComponentName(name: string): boolean {
    return /^[A-Z]/.test(name);
  }

  private isCustomHookName(name: string): boolean {
    return /^use[A-Z]/.test(name);
  }

  private hasJsxReturn(code: string): boolean {
    return /<[A-Z]|<[a-z]+[\s>]|<>/.test(code);
  }

  private countByType(usages: StateUsage[]): Record<string, number> {
    const counts: Record<string, number> = {};
    for (const usage of usages) {
      counts[usage.type] = (counts[usage.type] || 0) + 1;
    }
    return counts;
  }
}
