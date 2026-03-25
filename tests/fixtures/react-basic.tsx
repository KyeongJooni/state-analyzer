import React, { useState, useContext, useReducer } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState<string>('');
  return <div>{count} {name}</div>;
}

export const TodoList = () => {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const theme = useContext(ThemeContext);
  return <ul>{todos.map(t => <li key={t.id}>{t.text}</li>)}</ul>;
};

function todoReducer(state: any[], action: any) {
  return state;
}
const ThemeContext = React.createContext('light');
