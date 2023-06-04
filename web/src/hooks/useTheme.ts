import useLocalStorage from './useLocalStorage';

export enum ITheme {
  Light = 'Light',
  Dark = 'Dark',
}

export default function useTheme() {
  return useLocalStorage<ITheme>('theme');
}
