import { useCallback } from 'react';
import { Dropdown, MenuProps, theme } from 'antd';
import {
  DeleteOutlined,
  EditOutlined,
  LoadingOutlined,
  MoreOutlined,
  PoweroffOutlined,
} from '@ant-design/icons';
import useSWR from 'swr';
import { get } from 'lodash-es';
import { Device, DeviceStatus } from '@/types/device';
import useMessage from '@/hooks/useMessage';
import useModal from '@/hooks/useModal';
import DeviceEdit from '../DeviceEdit';
import useBoolean from '@/hooks/useBoolean';
import { useDeleteDevice, useWakeDevice } from '@/hooks/useDevices';
import styles from './index.module.less';
import fetcher from '@/utils/fetcher';

export interface DeviceCardProps {
  device: Device;
}

export default function DeviceCard({ device }: DeviceCardProps) {
  const { token } = theme.useToken();
  const message = useMessage();
  const modal = useModal();
  const [open, actions] = useBoolean(false);

  const {
    data: status,
    isLoading,
    mutate: fetchDeviceStatus,
  } = useSWR(
    `/device/status/${device.ip}`,
    (url) => fetcher.get<unknown, DeviceStatus>(url),
    {
      refreshInterval: 7000,
    },
  );

  const { isMutating: isWaking, trigger: wakeDevice } = useWakeDevice({
    onSuccess: () => {
      fetchDeviceStatus();
    },
    onError: (err) => {
      message.error(get(err, 'response.data.message', '开机失败'));
    },
  });

  const { trigger: deleteDevice } = useDeleteDevice({
    onSuccess: () => {
      message.success('删除成功');
    },
    onError: (err) => {
      message.error(get(err, 'response.data.message', '删除失败'));
    },
  });

  const onWake = useCallback(() => {
    if (isWaking) {
      return;
    }
    wakeDevice(device);
  }, [isWaking, device, wakeDevice]);

  const items: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: '编辑',
      onClick: actions.setTrue,
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: '删除',
      onClick: () => {
        modal.confirm({
          title: '删除',
          content: `确认删除设备 ${device.name} 吗？`,
          onOk: () => deleteDevice(device),
        });
      },
    },
  ];

  return (
    <>
      <div
        className={styles.device}
        style={{
          backgroundColor: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <div
          className={styles.switch}
          role="button"
          tabIndex={0}
          onClick={onWake}
          style={{ color: token.colorWarning }}
        >
          <PoweroffOutlined />
        </div>
        <div className={styles.info}>
          <div className={styles.name}>{device.name}</div>
          <div className={styles.mac}>{device.mac}</div>
        </div>
        {status === DeviceStatus.Online && (
          <div
            className={styles.online}
            style={{
              backgroundColor: token.colorSuccess,
            }}
          />
        )}
        {(isLoading || isWaking) && (
          <div
            className={styles.loading}
            style={{
              color: token.colorPrimaryText,
            }}
          >
            <LoadingOutlined />
          </div>
        )}
        <div className={styles.edit}>
          <Dropdown
            menu={{ items }}
            placement="bottomRight"
            trigger={['click']}
            arrow={{ pointAtCenter: true }}
          >
            <div className={styles.editBtn}>
              <MoreOutlined />
            </div>
          </Dropdown>
        </div>
      </div>

      <DeviceEdit
        open={open}
        device={device}
        onOk={actions.setFalse}
        onCancel={actions.setFalse}
      />
    </>
  );
}
