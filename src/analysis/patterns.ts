import { StateType } from '../types';

export interface StatePattern {
  regex: RegExp;
  type: StateType;
}

export const STATE_PATTERNS: StatePattern[] = [
  // React built-in
  { regex: /useState\s*[<(]/g, type: 'useState' },
  { regex: /useContext\s*\(/g, type: 'useContext' },
  { regex: /useReducer\s*\(/g, type: 'useReducer' },
  // Zustand
  { regex: /use[A-Z]\w*Store\s*\(/g, type: 'zustand' },
  // Jotai
  { regex: /useAtom\s*\(/g, type: 'jotai' },
  { regex: /useAtomValue\s*\(/g, type: 'jotai' },
  { regex: /useSetAtom\s*\(/g, type: 'jotai' },
  // Redux
  { regex: /useSelector\s*[<(]/g, type: 'redux' },
  { regex: /useDispatch\s*[<(]/g, type: 'redux' },
  { regex: /useStore\s*[<(]/g, type: 'redux' },
  // MobX
  { regex: /useLocalObservable\s*\(/g, type: 'mobx' },
  { regex: /observer\s*\(/g, type: 'mobx' },
  // Recoil
  { regex: /useRecoilState\s*\(/g, type: 'recoil' },
  { regex: /useRecoilValue\s*\(/g, type: 'recoil' },
  { regex: /useSetRecoilState\s*\(/g, type: 'recoil' },
  // Valtio
  { regex: /useSnapshot\s*\(/g, type: 'valtio' },
  // TanStack Query
  { regex: /useQuery\s*[<(]/g, type: 'tanstack-query' },
  { regex: /useMutation\s*[<(]/g, type: 'tanstack-query' },
  { regex: /useInfiniteQuery\s*[<(]/g, type: 'tanstack-query' },
  { regex: /useSuspenseQuery\s*[<(]/g, type: 'tanstack-query' },
  // SWR
  { regex: /useSWR\s*[<(]/g, type: 'swr' },
  { regex: /useSWRMutation\s*[<(]/g, type: 'swr' },
];

export const USE_STATE_DESTRUCTURE = /\[\s*(\w+)\s*,\s*\w+\s*\]\s*=\s*useState/g;
export const USE_REDUCER_DESTRUCTURE = /\[\s*(\w+)\s*,\s*\w+\s*\]\s*=\s*useReducer/g;
