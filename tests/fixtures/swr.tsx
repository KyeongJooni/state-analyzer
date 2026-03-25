import React from 'react';

export function SwrProfile() {
  const { data } = useSWR('/api/user', fetcher);
  return <div>{data?.name}</div>;
}

export const SwrMutator = () => {
  const { trigger } = useSWRMutation('/api/user', updateUser);
  return <button onClick={() => trigger()}>Update</button>;
};
