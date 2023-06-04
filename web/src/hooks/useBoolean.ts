import { useMemo, useState } from 'react';

type IUseBooleanOpts = boolean | (() => boolean);
interface IUseBooleanAction {
  setTrue: () => void;
  setFalse: () => void;
}

export default function useBoolean(
  defaultValue: IUseBooleanOpts = false,
): [boolean, IUseBooleanAction] {
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
