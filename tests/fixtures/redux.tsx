import React from 'react';

export const UserProfile = () => {
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  return <div>{user.name}</div>;
};

export function Settings() {
  const store = useStore();
  const theme = useSelector<RootState, string>(state => state.theme);
  return <div>{theme}</div>;
}
