import { ConfigProvider, App, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import useTheme, { ITheme } from './hooks/useTheme';
import Root from './components/Root';

export default function Wol() {
  const [themeValue] = useTheme();
  const algorithm = themeValue === ITheme.Dark ? theme.darkAlgorithm : theme.defaultAlgorithm;

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm,
      }}
    >
      <App>
        <Root />
      </App>
    </ConfigProvider>
  );
}
