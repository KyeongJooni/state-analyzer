<div align="center">

# State Analyzer

<p align="center">
  <strong>Analyze Frontend state management patterns</strong>
</p>

[![npm version](https://img.shields.io/npm/v/state-analyzer.svg)](https://www.npmjs.com/package/state-analyzer)
[![license](https://img.shields.io/npm/l/state-analyzer.svg)](https://github.com/KyeongJooni/state-analyzer/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/state-analyzer.svg)](https://nodejs.org)

[Homepage](https://kyeongjooni.github.io/state-analyzer/) · [npm](https://www.npmjs.com/package/state-analyzer) · [한국어](README.ko.md)

</div>

---

**State Analyzer** statically analyzes your Frontend codebase to detect state management patterns, measure complexity, and catch anti-patterns. It supports 11 state libraries, Next.js server/client detection, and custom plugin patterns.

## Quick Start

```bash
# Install
npm install -g state-analyzer
# or: yarn global add state-analyzer / pnpm add -g state-analyzer / bun add -g state-analyzer

# Generate config
state-analyzer init

# Analyze
state-analyzer analyze ./src
```

## Features

- **11 Library Support** — React hooks, Redux, Zustand, Jotai, MobX, Recoil, Valtio, TanStack Query, SWR
- **Next.js Support** — Server/client component detection, route file classification, hook misuse warnings
- **Custom Hook Analysis** — Detects custom hook definitions and traces internal state usage
- **Complexity Scoring** — A~F grade per component and project-wide, `--threshold` for CI gate
- **Anti-pattern Detection** — Unused state, excessive hooks (6+), library mixing (3+), useContext overuse
- **Multiple Outputs** — Terminal, Markdown (`--format md`), Mermaid diagram (`--mermaid`), JSON
- **Diff Mode** — Compare two analysis snapshots to track state changes over time
- **Watch Mode** — Live re-analysis on file changes
- **Plugin System** — Register custom state patterns via `.stateanalyzerrc.json`

## Supported Libraries

| Library | Hooks Detected |
|---------|---------------|
| **React** | `useState`, `useContext`, `useReducer` |
| **Redux** | `useSelector`, `useDispatch`, `useStore` |
| **Zustand** | `use*Store()` patterns |
| **Jotai** | `useAtom`, `useAtomValue`, `useSetAtom` |
| **MobX** | `observer`, `useLocalObservable` |
| **Recoil** | `useRecoilState`, `useRecoilValue`, `useSetRecoilState` |
| **Valtio** | `useSnapshot` |
| **TanStack Query** | `useQuery`, `useMutation`, `useInfiniteQuery`, `useSuspenseQuery` |
| **SWR** | `useSWR`, `useSWRMutation` |

## Usage

```bash
state-analyzer analyze ./src                # Basic analysis
state-analyzer analyze ./src --verbose      # Detailed output
state-analyzer analyze ./src --format md    # Markdown report
state-analyzer analyze ./src --mermaid      # Mermaid diagram
state-analyzer analyze ./src --output a.json # JSON export
state-analyzer analyze ./src --threshold C  # CI gate
state-analyzer diff before.json after.json  # Compare snapshots
state-analyzer watch ./src                  # Live watch
```

## Options

| Option | Alias | Description |
|--------|-------|-------------|
| `--output <file>` | `-o` | Save results as JSON |
| `--verbose` | `-v` | Show detailed component information |
| `--threshold <grade>` | `-t` | Fail if complexity exceeds grade (A/B/C/D/F) |
| `--format <type>` | `-f` | Output format: `default`, `md` |
| `--mermaid` | - | Output Mermaid dependency diagram |

## Example Output

```
=== Analysis Summary ===

Total components: 68
Components with state: 12 (17.6%)
Total state usage: 20
Average: 1.7 states/component
Custom hooks: 30
Environment: 8 client / 4 server

Usage by type:
  useState: 16
  Zustand: 4

=== Complexity ===

Project grade: A (score: 1.1)

Component grades:
  A ████████████████████ (64)
  B ██ (2)
  C ██ (2)

=== Suggestions ===

  ! ToastProvider (src/contexts/ToastContext.tsx)
    4 state hooks detected — consider extracting to a custom hook
```

## Configuration

Create `.stateanalyzerrc.json` via `state-analyzer init`, or manually:

```json
{
  "exclude": ["legacy/", "generated/"],
  "threshold": "C",
  "plugins": [
    {
      "name": "legend-state",
      "patterns": [{ "regex": "useObservable\\s*\\(", "type": "legend-state" }],
      "label": "Legend State"
    }
  ]
}
```

For full documentation, visit the [Homepage](https://kyeongjooni.github.io/state-analyzer/).

## Requirements

- Node.js >= 16.0.0

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[MIT](LICENSE)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/KyeongJooni">KyeongJooni</a></sub>
</div>
