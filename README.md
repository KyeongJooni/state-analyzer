<div align="center">

# React State Analyzer

<p align="center">
  <strong>CLI tool for analyzing React state management patterns</strong>
</p>

[![npm version](https://img.shields.io/npm/v/react-state-analyzer.svg)](https://www.npmjs.com/package/react-state-analyzer)
[![npm downloads](https://img.shields.io/npm/dm/react-state-analyzer.svg)](https://www.npmjs.com/package/react-state-analyzer)
[![license](https://img.shields.io/npm/l/react-state-analyzer.svg)](https://github.com/KyeongJooni/react-state-analyzer/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/react-state-analyzer.svg)](https://nodejs.org)

</div>

---

## Overview

React State Analyzer statically analyzes your React codebase to provide insights into state management patterns, complexity hotspots, and potential anti-patterns.

## Features

- **11 Library Support** - React hooks, Redux, Zustand, Jotai, MobX, Recoil, Valtio, TanStack Query, SWR
- **Custom Hook Analysis** - Detects custom hook definitions and their internal state usage
- **Complexity Scoring** - A~F grade per component and project-wide average
- **Unused State Detection** - Warns about declared but never-used state variables
- **Re-render Risk Detection** - Flags anti-patterns like excessive hooks or library mixing
- **JSON Export** - Save analysis results for CI/CD integration
- **Threshold Check** - `--threshold` option for CI gate (exit code 1 on failure)

## Installation

```bash
npm install -g react-state-analyzer
# or
yarn global add react-state-analyzer
# or
pnpm add -g react-state-analyzer
# or
bun add -g react-state-analyzer
```

## Usage

```bash
# Basic analysis
state-analyzer analyze ./src

# Verbose output with component details
state-analyzer analyze ./src --verbose

# Export results to JSON
state-analyzer analyze ./src --output analysis.json

# CI gate: fail if project complexity exceeds grade C
state-analyzer analyze ./src --threshold C
```

## Example Output

```
Starting state analysis...

=== Analysis Summary ===

Total components: 45
Components with state: 28 (62.2%)
Total state usage: 87
Average: 3.1 states/component
Custom hooks: 5

Usage by type:
  useState: 52
  Redux: 23
  Zustand: 18
  useContext: 12
  TanStack Query: 8
  Jotai: 5

=== Complexity ===

Project grade: B (score: 8.3)

Component grades:
  A ████████████████ (16)
  B ████████ (8)
  C ██ (2)
  D █ (1)

=== Top 10 Components ===

 1. UserDashboard D (8 states) - src/pages/Dashboard.tsx
    useState(3), Redux(2), Zustand(2), useContext(1)

=== Suggestions ===

  ! UserDashboard (src/pages/Dashboard.tsx)
    8 state hooks detected — consider grouping related state with useReducer or extracting to a custom hook
```

## Supported State Patterns

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

## CLI Options

| Option | Alias | Description |
|--------|-------|-------------|
| `<path>` | - | Directory to analyze (required) |
| `--output <file>` | `-o` | Save results as JSON |
| `--verbose` | `-v` | Show detailed component information |
| `--threshold <grade>` | `-t` | Fail if project complexity exceeds grade (A/B/C/D/F) |

## Requirements

- Node.js >= 16.0.0

## License

[MIT](LICENSE)

## Links

- [npm package](https://www.npmjs.com/package/react-state-analyzer)
- [GitHub repository](https://github.com/KyeongJooni/react-state-analyzer)
- [Issues](https://github.com/KyeongJooni/react-state-analyzer/issues)
