<div align="center">

# State Analyzer

<p align="center">
  <strong>Frontend 상태 관리 패턴 분석 도구</strong>
</p>

[![npm version](https://img.shields.io/npm/v/state-analyzer.svg)](https://www.npmjs.com/package/state-analyzer)
[![license](https://img.shields.io/npm/l/state-analyzer.svg)](https://github.com/KyeongJooni/state-analyzer/blob/main/LICENSE)
[![node version](https://img.shields.io/node/v/state-analyzer.svg)](https://nodejs.org)

[홈페이지](https://kyeongjooni.github.io/state-analyzer/) · [npm](https://www.npmjs.com/package/state-analyzer) · [English](README.md)

</div>

---

**State Analyzer**는 Frontend 코드베이스를 정적 분석하여 상태 관리 패턴을 감지하고, 복잡도를 측정하며, 안티패턴을 찾아냅니다. 11개 상태 라이브러리, Next.js 서버/클라이언트 감지, 커스텀 플러그인 패턴을 지원합니다.

## 시작하기

```bash
# 설치
npm install -g state-analyzer
# 또는: yarn global add state-analyzer / pnpm add -g state-analyzer / bun add -g state-analyzer

# 설정 파일 생성
state-analyzer init

# 분석 실행
state-analyzer analyze ./src
```

## 주요 기능

- **11개 라이브러리 지원** — React hooks, Redux, Zustand, Jotai, MobX, Recoil, Valtio, TanStack Query, SWR
- **Next.js 지원** — 서버/클라이언트 컴포넌트 감지, 라우트 파일 분류, 훅 오용 경고
- **커스텀 훅 분석** — 커스텀 훅 정의를 감지하고 내부 상태 사용을 추적
- **복잡도 스코어링** — 컴포넌트별/프로젝트 전체 A~F 등급, `--threshold`로 CI 게이트
- **안티패턴 감지** — 미사용 상태, 과도한 훅 사용(6개+), 라이브러리 혼합(3종+), useContext 남용
- **다양한 출력** — 터미널, 마크다운(`--format md`), Mermaid 다이어그램(`--mermaid`), JSON
- **Diff 모드** — 두 분석 결과를 비교하여 상태 변화 추적
- **Watch 모드** — 파일 변경 시 실시간 재분석
- **플러그인** — `.stateanalyzerrc.json`으로 커스텀 상태 패턴 등록

## 지원 라이브러리

| 라이브러리 | 감지 패턴 |
|-----------|----------|
| **React** | `useState`, `useContext`, `useReducer` |
| **Redux** | `useSelector`, `useDispatch`, `useStore` |
| **Zustand** | `use*Store()` 패턴 |
| **Jotai** | `useAtom`, `useAtomValue`, `useSetAtom` |
| **MobX** | `observer`, `useLocalObservable` |
| **Recoil** | `useRecoilState`, `useRecoilValue`, `useSetRecoilState` |
| **Valtio** | `useSnapshot` |
| **TanStack Query** | `useQuery`, `useMutation`, `useInfiniteQuery`, `useSuspenseQuery` |
| **SWR** | `useSWR`, `useSWRMutation` |

## 사용법

```bash
state-analyzer analyze ./src                # 기본 분석
state-analyzer analyze ./src --verbose      # 상세 출력
state-analyzer analyze ./src --format md    # 마크다운 리포트
state-analyzer analyze ./src --mermaid      # Mermaid 다이어그램
state-analyzer analyze ./src --output a.json # JSON 내보내기
state-analyzer analyze ./src --threshold C  # CI 게이트
state-analyzer diff before.json after.json  # 스냅샷 비교
state-analyzer watch ./src                  # 실시간 감시
```

## 옵션

| 옵션 | 단축 | 설명 |
|------|------|------|
| `--output <file>` | `-o` | 결과를 JSON 파일로 저장 |
| `--verbose` | `-v` | 컴포넌트별 상세 정보 출력 |
| `--threshold <grade>` | `-t` | 복잡도 등급 초과 시 실패 (A/B/C/D/F) |
| `--format <type>` | `-f` | 출력 형식: `default`, `md` |
| `--mermaid` | - | Mermaid 의존성 다이어그램 출력 |

## 출력 예시

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

## 설정

`state-analyzer init`으로 설정 파일을 생성하거나, 직접 `.stateanalyzerrc.json`을 작성할 수 있습니다:

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

자세한 문서는 [홈페이지](https://kyeongjooni.github.io/state-analyzer/)를 참고하세요.

## 요구사항

- Node.js >= 16.0.0

## 기여

기여를 환영합니다! Pull Request를 자유롭게 제출해주세요.

## 라이선스

[MIT](LICENSE)

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/KyeongJooni">KyeongJooni</a></sub>
</div>
