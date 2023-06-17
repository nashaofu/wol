import { useMemo, useState } from 'react';

type UseBooleanOpts = boolean | (() => boolean);
interface UseBooleanAction {
  setTrue: () => void;
  setFalse: () => void;
}

export default function useBoolean(
  defaultValue: UseBooleanOpts = false,
): [boolean, UseBooleanAction] {
  const [state, setState] = useState(defaultValue);

  const actions = useMemo(
    () => ({
      setTrue: () => setState(true),
      setFalse: () => setState(false),
    }),
    [],
  );

  return [state, actions];
}
