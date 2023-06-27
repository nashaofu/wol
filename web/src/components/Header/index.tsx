import { useCallback } from 'react';
import { Layout, Switch, theme } from 'antd';
import {
  BulbOutlined,
  BulbFilled,
  PlusCircleOutlined,
  LockOutlined,
} from '@ant-design/icons';
import useTheme, { ITheme } from '@/hooks/useTheme';
import AuthEdit from '../AuthEdit';
import DeviceEdit from '../DeviceEdit';
import useBoolean from '@/hooks/useBoolean';
import styles from './index.module.less';

export default function Header() {
  const [themeValue, setThemeValue] = useTheme();
  const [deviceEditOpen, deviceEditActions] = useBoolean(false);
  const [authEditOpen, authEditActions] = useBoolean(false);
  const { token } = theme.useToken();
  const style = {
    color: token.colorTextLightSolid,
  };

  const onThemeValueChange = useCallback(
    (checked: boolean) => {
      if (checked) {
        setThemeValue(ITheme.Dark);
      } else {
        setThemeValue(ITheme.Light);
      }
    },
    [setThemeValue],
  );

  return (
    <>
      <Layout.Header className={styles.header}>
        <div className={styles.container} style={style}>
          <div className={styles.logo}>Wol</div>
          <div className={styles.buttons}>
            <Switch
              checked={themeValue === ITheme.Dark}
              checkedChildren={<BulbFilled />}
              unCheckedChildren={<BulbOutlined />}
              onChange={onThemeValueChange}
            />
            <div
              className={styles.button}
              role="button"
              tabIndex={0}
              onClick={deviceEditActions.setTrue}
            >
              <PlusCircleOutlined />
            </div>
            <div
              className={styles.button}
              role="button"
              tabIndex={0}
              onClick={authEditActions.setTrue}
            >
              <LockOutlined />
            </div>
          </div>
        </div>
      </Layout.Header>

      <AuthEdit
        open={authEditOpen}
        onOk={authEditActions.setFalse}
        onCancel={authEditActions.setFalse}
      />

      <DeviceEdit
        open={deviceEditOpen}
        onOk={deviceEditActions.setFalse}
        onCancel={deviceEditActions.setFalse}
      />
    </>
  );
}
