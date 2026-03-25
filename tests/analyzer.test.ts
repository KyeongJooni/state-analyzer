import { describe, it, expect, beforeEach } from 'vitest';
import * as path from 'path';
import { StateAnalyzer } from '../src/analyzer';

const FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

describe('StateAnalyzer', () => {
  let analyzer: StateAnalyzer;

  beforeEach(() => {
    analyzer = new StateAnalyzer();
  });

  describe('basic analysis', () => {
    it('should discover components in fixture directory', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      expect(result.components.length).toBeGreaterThan(0);
      expect(result.summary.totalComponents).toBe(result.components.length);
    });

    it('should skip non-component files like utils.ts', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const utilComponents = result.components.filter((c) => c.file.includes('utils'));
      expect(utilComponents).toHaveLength(0);
    });
  });

  describe('React built-in hooks', () => {
    it('should detect useState', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const counter = result.components.find((c) => c.name === 'Counter');
      expect(counter).toBeDefined();
      const useStateUsages = counter!.stateUsages.filter((u) => u.type === 'useState');
      expect(useStateUsages).toHaveLength(2);
    });

    it('should detect useContext', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const todoList = result.components.find((c) => c.name === 'TodoList');
      expect(todoList).toBeDefined();
      const contextUsages = todoList!.stateUsages.filter((u) => u.type === 'useContext');
      expect(contextUsages).toHaveLength(1);
    });

    it('should detect useReducer', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const todoList = result.components.find((c) => c.name === 'TodoList');
      expect(todoList).toBeDefined();
      const reducerUsages = todoList!.stateUsages.filter((u) => u.type === 'useReducer');
      expect(reducerUsages).toHaveLength(1);
    });
  });

  describe('Redux', () => {
    it('should detect useSelector and useDispatch', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const userProfile = result.components.find((c) => c.name === 'UserProfile');
      expect(userProfile).toBeDefined();
      const reduxUsages = userProfile!.stateUsages.filter((u) => u.type === 'redux');
      expect(reduxUsages).toHaveLength(2);
    });

    it('should detect useStore and generic useSelector', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const settings = result.components.find((c) => c.name === 'Settings');
      expect(settings).toBeDefined();
      const reduxUsages = settings!.stateUsages.filter((u) => u.type === 'redux');
      expect(reduxUsages).toHaveLength(2);
    });
  });

  describe('Zustand', () => {
    it('should detect useXxxStore patterns', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const dashboard = result.components.find((c) => c.name === 'Dashboard');
      expect(dashboard).toBeDefined();
      const zustandUsages = dashboard!.stateUsages.filter((u) => u.type === 'zustand');
      expect(zustandUsages).toHaveLength(2);
    });
  });

  describe('Jotai', () => {
    it('should detect useAtom, useAtomValue, useSetAtom', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const themeToggle = result.components.find((c) => c.name === 'ThemeToggle');
      const readOnly = result.components.find((c) => c.name === 'ReadOnlyDisplay');

      expect(themeToggle).toBeDefined();
      expect(themeToggle!.stateUsages.filter((u) => u.type === 'jotai')).toHaveLength(1);

      expect(readOnly).toBeDefined();
      expect(readOnly!.stateUsages.filter((u) => u.type === 'jotai')).toHaveLength(2);
    });
  });

  describe('MobX', () => {
    it('should detect observer and useLocalObservable', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const observerComp = result.components.find((c) => c.name === 'ObserverComponent');
      expect(observerComp).toBeDefined();
      const mobxUsages = observerComp!.stateUsages.filter((u) => u.type === 'mobx');
      expect(mobxUsages.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Recoil', () => {
    it('should detect useRecoilState', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const recoilCounter = result.components.find((c) => c.name === 'RecoilCounter');
      expect(recoilCounter).toBeDefined();
      const recoilUsages = recoilCounter!.stateUsages.filter((u) => u.type === 'recoil');
      expect(recoilUsages).toHaveLength(1);
    });

    it('should detect useRecoilValue and useSetRecoilState', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const display = result.components.find((c) => c.name === 'RecoilDisplay');
      expect(display).toBeDefined();
      const recoilUsages = display!.stateUsages.filter((u) => u.type === 'recoil');
      expect(recoilUsages).toHaveLength(2);
    });
  });

  describe('Valtio', () => {
    it('should detect useSnapshot', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const valtioCounter = result.components.find((c) => c.name === 'ValtioCounter');
      expect(valtioCounter).toBeDefined();
      const valtioUsages = valtioCounter!.stateUsages.filter((u) => u.type === 'valtio');
      expect(valtioUsages).toHaveLength(1);
    });
  });

  describe('TanStack Query', () => {
    it('should detect useQuery and useMutation', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const userList = result.components.find((c) => c.name === 'UserList');
      expect(userList).toBeDefined();
      const queryUsages = userList!.stateUsages.filter((u) => u.type === 'tanstack-query');
      expect(queryUsages).toHaveLength(2);
    });

    it('should detect useInfiniteQuery and useSuspenseQuery', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const infiniteList = result.components.find((c) => c.name === 'InfiniteList');
      expect(infiniteList).toBeDefined();
      const queryUsages = infiniteList!.stateUsages.filter((u) => u.type === 'tanstack-query');
      expect(queryUsages).toHaveLength(2);
    });
  });

  describe('SWR', () => {
    it('should detect useSWR', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const swrProfile = result.components.find((c) => c.name === 'SwrProfile');
      expect(swrProfile).toBeDefined();
      const swrUsages = swrProfile!.stateUsages.filter((u) => u.type === 'swr');
      expect(swrUsages).toHaveLength(1);
    });

    it('should detect useSWRMutation', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const swrMutator = result.components.find((c) => c.name === 'SwrMutator');
      expect(swrMutator).toBeDefined();
      const swrUsages = swrMutator!.stateUsages.filter((u) => u.type === 'swr');
      expect(swrUsages).toHaveLength(1);
    });
  });

  describe('custom hook analysis', () => {
    it('should detect custom hook definitions', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      expect(result.customHooks.length).toBeGreaterThanOrEqual(3);
    });

    it('should analyze internal useState in useAuth', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const useAuth = result.customHooks.find((h) => h.name === 'useAuth');
      expect(useAuth).toBeDefined();
      const useStateUsages = useAuth!.internalStateUsages.filter((u) => u.type === 'useState');
      expect(useStateUsages).toHaveLength(2);
    });

    it('should analyze useState + useContext in useCart', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const useCart = result.customHooks.find((h) => h.name === 'useCart');
      expect(useCart).toBeDefined();
      expect(useCart!.internalStateUsages.filter((u) => u.type === 'useState')).toHaveLength(1);
      expect(useCart!.internalStateUsages.filter((u) => u.type === 'useContext')).toHaveLength(1);
    });

    it('should detect useFormValidation', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const hook = result.customHooks.find((h) => h.name === 'useFormValidation');
      expect(hook).toBeDefined();
      expect(hook!.internalStateUsages.filter((u) => u.type === 'useState')).toHaveLength(2);
    });
  });

  describe('mixed patterns', () => {
    it('should detect multiple library usage in HeavyComponent', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const heavy = result.components.find((c) => c.name === 'HeavyComponent');
      expect(heavy).toBeDefined();

      const types = heavy!.stateUsages.map((u) => u.type);
      expect(types).toContain('useState');
      expect(types).toContain('redux');
      expect(types).toContain('valtio');
      expect(types).toContain('tanstack-query');
    });
  });

  describe('summary statistics', () => {
    it('should include all detected types in byType', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      expect(result.summary.byType).toBeDefined();
      expect(result.summary.totalStateUsages).toBe(
        (Object.values(result.summary.byType) as number[]).reduce((a, b) => a + b, 0),
      );
    });

    it('should have accurate totalComponents', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      expect(result.summary.totalComponents).toBe(result.components.length);
    });
  });

  describe('complexity scoring', () => {
    it('should assign complexity to all components', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      for (const comp of result.components) {
        expect(comp.complexity).toBeDefined();
        expect(comp.complexity!.grade).toMatch(/^[A-F]$/);
        expect(comp.complexity!.score).toBeGreaterThanOrEqual(0);
      }
    });

    it('should grade simple components as A or B', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const simple = result.components.find((c) => c.name === 'SimpleButton');
      expect(simple).toBeDefined();
      expect(['A', 'B']).toContain(simple!.complexity!.grade);
    });

    it('should grade complex components as D or F', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const mega = result.components.find((c) => c.name === 'MegaComponent');
      expect(mega).toBeDefined();
      expect(['D', 'F']).toContain(mega!.complexity!.grade);
    });

    it('should include project complexity in summary', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      expect(result.summary.complexity).toBeDefined();
      expect(result.summary.complexity!.grade).toMatch(/^[A-F]$/);
      expect(result.summary.complexity!.averageScore).toBeGreaterThan(0);

      const totalGrades = (
        Object.values(result.summary.complexity!.componentGrades) as number[]
      ).reduce((a, b) => a + b, 0);
      expect(totalGrades).toBe(result.components.length);
    });
  });

  describe('unused state detection', () => {
    it('should warn about unused useState variables', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const unusedWarnings = result.suggestions.filter(
        (s) => s.component === 'UnusedStateComponent' && s.message.includes('unused'),
      );
      expect(unusedWarnings.length).toBeGreaterThanOrEqual(1);
    });

    it('should not warn when all state is used', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const allUsedWarnings = result.suggestions.filter(
        (s) => s.component === 'AllUsedComponent' && s.message.includes('never used'),
      );
      expect(allUsedWarnings).toHaveLength(0);
    });

    it('should warn about unused useReducer state', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const reducerWarnings = result.suggestions.filter(
        (s) => s.component === 'UnusedReducerComponent' && s.message.includes('state'),
      );
      expect(reducerWarnings.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('re-render risk detection', () => {
    it('should warn when component has 6+ state hooks', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const mega = result.suggestions.filter(
        (s) => s.component === 'MegaComponent' && s.message.includes('state hooks detected'),
      );
      expect(mega.length).toBeGreaterThanOrEqual(1);
    });

    it('should warn when mixing 3+ state libraries', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const mixWarnings = result.suggestions.filter(
        (s) => s.component === 'MegaComponent' && s.message.includes('Mixing'),
      );
      expect(mixWarnings.length).toBeGreaterThanOrEqual(1);
    });

    it('should suggest improvement for 3+ useContext calls', () => {
      const result = analyzer.analyze(FIXTURES_DIR);
      const contextWarnings = result.suggestions.filter(
        (s) => s.component === 'ContextHeavy' && s.message.includes('useContext'),
      );
      expect(contextWarnings.length).toBeGreaterThanOrEqual(1);
    });
  });
});
