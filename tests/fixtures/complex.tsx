import React, { useState, useContext, useReducer } from 'react';

// Grade F: very complex component
export function MegaComponent() {
  const [a, setA] = useState('');
  const [b, setB] = useState(0);
  const [c, setC] = useState(false);
  const theme = useContext(ThemeContext);
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const snap = useSnapshot(proxyState);
  const { data } = useQuery({ queryKey: ['x'], queryFn: fetch });
  return <div>{a}{b}{c}{theme}{user}{snap}{data}</div>;
}

// Grade A: simple component
export const SimpleButton = () => {
  const [clicked, setClicked] = useState(false);
  return <button onClick={() => setClicked(true)}>{clicked}</button>;
};

// Many useContext calls
export function ContextHeavy() {
  const theme = useContext(ThemeContext);
  const auth = useContext(AuthContext);
  const i18n = useContext(I18nContext);
  const notifications = useContext(NotificationContext);
  return <div>{theme}{auth}{i18n}{notifications}</div>;
}

const ThemeContext = React.createContext('light');
const AuthContext = React.createContext(null);
const I18nContext = React.createContext('en');
const NotificationContext = React.createContext([]);
