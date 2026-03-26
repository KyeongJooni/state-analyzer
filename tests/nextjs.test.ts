import { describe, it, expect, beforeEach } from 'vitest';
import * as path from 'path';
import { StateAnalyzer } from '@/analyzer';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

describe('Next.js support', () => {
  let analyzer: StateAnalyzer;

  beforeEach(() => {
    analyzer = new StateAnalyzer();
  });

  describe('environment detection', () => {
    it('should detect "use client" components as client', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const clientCounter = result.components.find((c) => c.name === 'ClientCounter');
      expect(clientCounter).toBeDefined();
      expect(clientCounter!.environment).toBe('client');
    });

    it('should detect "use server" components as server', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const serverAction = result.components.find((c) => c.name === 'ServerAction');
      expect(serverAction).toBeDefined();
      expect(serverAction!.environment).toBe('server');
    });

    it('should detect components without directive as unknown', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const counter = result.components.find((c) => c.name === 'Counter');
      expect(counter).toBeDefined();
      expect(counter!.environment).toBe('unknown');
    });
  });

  describe('route type detection', () => {
    it('should detect page.tsx as page route type', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const page = result.components.find((c) => c.name === 'Page');
      expect(page).toBeDefined();
      expect(page!.nextRouteType).toBe('page');
    });

    it('should detect layout.tsx as layout route type', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const layout = result.components.find((c) => c.name === 'Layout');
      expect(layout).toBeDefined();
      expect(layout!.nextRouteType).toBe('layout');
    });

    it('should set none for non-route files', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const counter = result.components.find((c) => c.name === 'Counter');
      expect(counter!.nextRouteType).toBe('none');
    });
  });

  describe('server component hook warning', () => {
    it('should not warn about hooks in client components', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const clientWarnings = result.suggestions.filter(
        (s) => s.component === 'ClientCounter' && s.message.includes('Server component'),
      );
      expect(clientWarnings).toHaveLength(0);
    });
  });
});
