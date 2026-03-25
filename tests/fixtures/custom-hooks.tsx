import React, { useState, useContext } from 'react';

// Custom hook definitions
export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  return { user, loading, setUser };
}

export const useCart = () => {
  const [items, setItems] = useState([]);
  const theme = useContext(ThemeContext);
  return { items, setItems, theme };
};

export function useFormValidation(initialValues: any) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  return { values, errors, setValues, setErrors };
}

// Component using custom hooks
export function LoginPage() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState('');
  return <div>{loading ? 'Loading...' : user?.name}</div>;
}

export const CartPage = () => {
  const { items } = useCart();
  return <div>{items.length}</div>;
};

const ThemeContext = React.createContext('light');
