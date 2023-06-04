import { App } from 'antd';

export default function useMessage() {
  const { message } = App.useApp();
  return message;
}
