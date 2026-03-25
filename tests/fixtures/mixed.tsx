import React, { useState } from 'react';

export function HeavyComponent() {
  const [local, setLocal] = useState('');
  const user = useSelector((state: any) => state.user);
  const dispatch = useDispatch();
  const snap = useSnapshot(proxyState);
  const { data } = useQuery({ queryKey: ['data'], queryFn: fetch });
  return <div>{local}</div>;
}
