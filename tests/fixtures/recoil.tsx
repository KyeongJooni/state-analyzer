import React from 'react';

export function RecoilCounter() {
  const [count, setCount] = useRecoilState(counterAtom);
  return <div>{count}</div>;
}

export const RecoilDisplay = () => {
  const value = useRecoilValue(displayAtom);
  const setValue = useSetRecoilState(settingsAtom);
  return <div>{value}</div>;
};
