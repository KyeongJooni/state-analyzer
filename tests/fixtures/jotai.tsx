import React from 'react';

export const ThemeToggle = () => {
  const [theme, setTheme] = useAtom(themeAtom);
  return <button onClick={() => setTheme(t => !t)}>{theme}</button>;
};

export function ReadOnlyDisplay() {
  const count = useAtomValue(countAtom);
  const setName = useSetAtom(nameAtom);
  return <div>{count}</div>;
}
