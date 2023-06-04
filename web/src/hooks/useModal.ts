import { App } from 'antd';

export default function useModal() {
  const { modal } = App.useApp();
  return modal;
}
