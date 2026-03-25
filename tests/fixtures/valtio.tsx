import React from 'react';

export const ValtioCounter = () => {
  const snap = useSnapshot(state);
  return <div>{snap.count}</div>;
};

export function ValtioForm() {
  const snap = useSnapshot(formState);
  return <input value={snap.name} />;
}
