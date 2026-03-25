import React from 'react';

export const CartPage = () => {
  const items = useCartStore((state) => state.items);
  return <div>{items.length}</div>;
};

export function Dashboard() {
  const data = useDataStore((state) => state.data);
  const auth = useAuthStore((state) => state.user);
  return <div>{data}</div>;
}
