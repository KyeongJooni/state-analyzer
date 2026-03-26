<div align="center">

# State Analyzer

<p align="center">
  <strong>Analyze Frontend state management patterns</strong>
</p>

[![npm version](https://img.shields.io/npm/v/state-analyzer.svg)](https://www.npmjs.com/package/state-analyzer)
[![npm downloads](https://img.shields.io/npm/dm/state-analyzer.svg)](https://www.npmjs.com/package/state-analyzer)
[![license](https://img.shields.io/npm/l/state-analyzer.svg)](https://github.com/KyeongJooni/react-state-analyzer/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/state-analyzer.svg)](https://nodejs.org)

[Homepage](https://kyeongjooni.github.io/react-state-analyzer/) · [npm](https://www.npmjs.com/package/state-analyzer) · [Issues](https://github.com/KyeongJooni/react-state-analyzer/issues)

</div>

---

Static analysis for Frontend codebases. Detect state management patterns, measure complexity, and catch anti-patterns across 11 libraries.

## Install

```bash
npm install -g state-analyzer
```

## Quick Start

```bash
state-analyzer init          # generate config
state-analyzer analyze ./src # run analysis
```

## Features

- **11 libraries** — React hooks, Redux, Zustand, Jotai, MobX, Recoil, Valtio, TanStack Query, SWR
- **Next.js** — server/client component detection, route file classification
- **Complexity scoring** — A~F grade, `--threshold` for CI gate
- **Custom hooks** — traces internal state usage
- **Anti-pattern detection** — unused state, excessive hooks, library mixing
- **Multiple outputs** — terminal, markdown (`--format md`), mermaid (`--mermaid`), JSON
- **Diff mode** — compare two analysis snapshots
- **Watch mode** — live re-analysis on file changes
- **Plugins** — register custom state patterns via `.stateanalyzerrc.json`

## Example Output

```
=== Analysis Summary ===

Total components: 68
Components with state: 12 (17.6%)
Average: 1.7 states/component
Environment: 8 client / 4 server

=== Complexity ===

Project grade: A (score: 1.1)

=== Suggestions ===

  ! ToastProvider (src/contexts/ToastContext.tsx)
    4 state hooks detected — consider extracting to a custom hook
```

For full documentation, visit the [homepage](https://kyeongjooni.github.io/react-state-analyzer/).

## Requirements

- Node.js >= 16.0.0

## License

[MIT](LICENSE)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/KyeongJooni">KyeongJooni</a></sub>
</div>
