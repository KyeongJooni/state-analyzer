import React from 'react';

export function UserList() {
  const { data } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const mutation = useMutation({ mutationFn: createUser });
  return <div>{data?.length}</div>;
}

export const InfiniteList = () => {
  const { data } = useInfiniteQuery({ queryKey: ['items'], queryFn: fetchItems });
  const { data: suspended } = useSuspenseQuery({ queryKey: ['safe'], queryFn: fetchSafe });
  return <div>{data?.pages.length}</div>;
};
