import React, { useState, useReducer } from 'react';

// Has unused state variable 'unused'
export function UnusedStateComponent() {
  const [unused, setUnused] = useState('never read');
  const [used, setUsed] = useState('read below');
  return <div onClick={() => setUnused('')}>{used}</div>;
}

// All state is used
export const AllUsedComponent = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState(0);
  return <div onClick={() => setName('x')}>{name}{age}</div>;
};

// Unused reducer state
export function UnusedReducerComponent() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });
  return <button onClick={() => dispatch({ type: 'inc' })}>click</button>;
}

function reducer(s: any, a: any) { return s; }
