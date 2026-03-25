// Global declarations for test fixtures
// These are dummy types so fixture files don't show TS errors in the IDE

declare const ThemeContext: any;
declare const AuthContext: any;
declare const I18nContext: any;
declare const NotificationContext: any;

// Atoms / Stores
declare const themeAtom: any;
declare const countAtom: any;
declare const nameAtom: any;
declare const counterAtom: any;
declare const displayAtom: any;
declare const settingsAtom: any;
declare const proxyState: any;
declare const formState: any;
declare const state: any;
declare const store: any;

// Redux
declare function useSelector<T = any, R = any>(selector: (state: T) => R): R;
declare function useDispatch(): any;
declare function useStore(): any;
declare type RootState = any;

// Zustand
declare function useCartStore(selector: any): any;
declare function useDataStore(selector: any): any;
declare function useAuthStore(selector: any): any;

// Jotai
declare function useAtom(atom: any): [any, any];
declare function useAtomValue(atom: any): any;
declare function useSetAtom(atom: any): any;

// MobX
declare function observer(component: any): any;
declare function useLocalObservable(init: any): any;

// Recoil
declare function useRecoilState(atom: any): [any, any];
declare function useRecoilValue(atom: any): any;
declare function useSetRecoilState(atom: any): any;

// Valtio
declare function useSnapshot(proxy: any): any;

// TanStack Query
declare function useQuery(options: any): any;
declare function useMutation(options: any): any;
declare function useInfiniteQuery(options: any): any;
declare function useSuspenseQuery(options: any): any;

// SWR
declare function useSWR(key: any, fetcher?: any): any;
declare function useSWRMutation(key: any, fetcher?: any): any;

// Misc
declare function fetchUsers(): any;
declare function createUser(): any;
declare function fetchItems(): any;
declare function fetchSafe(): any;
declare function fetcher(url: string): any;
declare function updateUser(key: any, data: any): any;
declare function fetch(...args: any[]): any;
declare const todoReducer: any;
declare const reducer: any;
