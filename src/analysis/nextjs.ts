import * as path from 'path';
import { SourceFile } from 'ts-morph';
import { ComponentEnvironment, ComponentInfo, NextRouteType, Suggestion } from '@/types';

const NEXT_ROUTE_FILES: Record<string, NextRouteType> = {
  page: 'page',
  layout: 'layout',
  loading: 'loading',
  error: 'error',
  route: 'route',
};

export function detectEnvironment(sourceFile: SourceFile): ComponentEnvironment {
  const text = sourceFile.getFullText();
  const firstLines = text.slice(0, 500);

  if (/['"]use client['"]/.test(firstLines)) return 'client';
  if (/['"]use server['"]/.test(firstLines)) return 'server';

  // Next.js App Router: files without directive are server components by default
  // But only if they look like Next.js route files
  const filePath = sourceFile.getFilePath();
  const routeType = detectRouteType(filePath);
  if (routeType !== 'none') return 'server';

  return 'unknown';
}

export function detectRouteType(filePath: string): NextRouteType {
  const baseName = path.basename(filePath).replace(/\.(tsx?|jsx?)$/, '');
  return NEXT_ROUTE_FILES[baseName] || 'none';
}

export function detectServerComponentHookUsage(comp: ComponentInfo): Suggestion[] {
  if (comp.environment !== 'server') return [];
  if (comp.stateUsages.length === 0) return [];

  const hookNames = comp.stateUsages.map((u) => u.name).join(', ');
  return [
    {
      type: 'warning',
      message: `Server component uses client hooks (${hookNames}) — add 'use client' directive or move hooks to a client component`,
      file: comp.file,
      component: comp.name,
    },
  ];
}
