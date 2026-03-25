import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadConfig, resolvePluginPatterns, resolvePluginLabels } from '@/config';
import { StateAnalyzer } from '@/analyzer';

describe('config loading', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sa-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('should return empty config when no config file exists', () => {
    const config = loadConfig(tmpDir);
    expect(config).toEqual({});
  });

  it('should load .stateanalyzerrc.json', () => {
    const configContent = { exclude: ['legacy/'], threshold: 'C' };
    fs.writeFileSync(path.join(tmpDir, '.stateanalyzerrc.json'), JSON.stringify(configContent));

    const config = loadConfig(tmpDir);
    expect(config.exclude).toEqual(['legacy/']);
    expect(config.threshold).toBe('C');
  });

  it('should load .stateanalyzerrc', () => {
    const configContent = { format: 'md' };
    fs.writeFileSync(path.join(tmpDir, '.stateanalyzerrc'), JSON.stringify(configContent));

    const config = loadConfig(tmpDir);
    expect(config.format).toBe('md');
  });
});

describe('plugin system', () => {
  it('should resolve plugin patterns to regex', () => {
    const plugins = [
      {
        name: 'legend-state',
        patterns: [{ regex: 'useObservable\\s*\\(', type: 'legend-state' }],
        label: 'Legend State',
      },
    ];

    const patterns = resolvePluginPatterns(plugins);
    expect(patterns).toHaveLength(1);
    expect(patterns[0].type).toBe('legend-state');
    expect(patterns[0].regex).toBeInstanceOf(RegExp);
    expect('useObservable('.match(patterns[0].regex)).toBeTruthy();
  });

  it('should resolve plugin labels', () => {
    const plugins = [
      {
        name: 'legend-state',
        patterns: [{ regex: 'useObservable\\s*\\(', type: 'legend-state' }],
        label: 'Legend State',
      },
    ];

    const labels = resolvePluginLabels(plugins);
    expect(labels['legend-state']).toBe('Legend State');
  });

  it('should apply plugin patterns in analyzer', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sa-plugin-'));
    fs.writeFileSync(
      path.join(tmpDir, 'comp.tsx'),
      `export function App() {
        const obs = useObservable({ count: 0 });
        return <div>{obs.count}</div>;
      }`,
    );

    const analyzer = new StateAnalyzer({
      plugins: [
        {
          name: 'legend-state',
          patterns: [{ regex: 'useObservable\\s*\\(', type: 'legend-state' as any }],
          label: 'Legend State',
        },
      ],
    });

    const result = analyzer.analyze(tmpDir);
    const app = result.components.find((c) => c.name === 'App');
    expect(app).toBeDefined();
    expect(app!.stateUsages.some((u) => u.type === ('legend-state' as any))).toBe(true);

    fs.rmSync(tmpDir, { recursive: true });
  });
});

describe('exclude config', () => {
  it('should exclude files matching exclude patterns', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sa-exclude-'));
    const legacyDir = path.join(tmpDir, 'legacy');
    fs.mkdirSync(legacyDir);

    fs.writeFileSync(
      path.join(legacyDir, 'Old.tsx'),
      `export function OldComponent() {
        const [x, setX] = useState(0);
        return <div>{x}</div>;
      }`,
    );
    fs.writeFileSync(
      path.join(tmpDir, 'New.tsx'),
      `export function NewComponent() {
        const [y, setY] = useState(0);
        return <div>{y}</div>;
      }`,
    );

    const analyzer = new StateAnalyzer({ exclude: ['legacy'] });
    const result = analyzer.analyze(tmpDir);

    expect(result.components.find((c) => c.name === 'OldComponent')).toBeUndefined();
    expect(result.components.find((c) => c.name === 'NewComponent')).toBeDefined();

    fs.rmSync(tmpDir, { recursive: true });
  });
});
