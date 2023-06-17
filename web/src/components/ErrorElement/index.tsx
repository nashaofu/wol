import { Button, Result, theme } from 'antd';
import styles from './index.module.less';

export interface ErrorElementProps {
  message?: string;
}

export default function ErrorElement({ message }: ErrorElementProps) {
  const { token } = theme.useToken();

  return (
    <div
      className={styles.error}
      style={{
        backgroundColor: token.colorBgContainer,
        color: token.colorText,
      }}
    >
      <Result
        status="error"
        title="页面发生错误"
        subTitle={message}
        extra={(
          <Button type="primary" onClick={() => window.location.reload()}>
            重新加载
          </Button>
        )}
      />
    </div>
  );
}
