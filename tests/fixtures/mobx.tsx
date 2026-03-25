import React from 'react';

export const ObserverComponent = observer(() => {
  const localStore = useLocalObservable(() => ({
    count: 0,
    increment() { this.count++; }
  }));
  return <div>{localStore.count}</div>;
});

export const SimpleObserver = observer(function SimpleObserver() {
  return <div>{store.value}</div>;
});
