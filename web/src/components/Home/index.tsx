import {
  Button, Col, Empty, Row, Spin,
} from 'antd';
import { useDevices } from '@/hooks/useDevices';
import DeviceCard from '@/components/DeviceCard';
import DeviceEdit from '../DeviceEdit';
import useBoolean from '@/hooks/useBoolean';
import styles from './index.module.less';

export default function Home() {
  const { data: devices = [], isLoading } = useDevices();
  const [open, actions] = useBoolean(false);

  return (
    <>
      <Spin spinning={isLoading} size="large">
        <div className={styles.home}>
          {!devices.length && (
            <Empty>
              <Button type="primary" onClick={actions.setTrue}>
                添加设备
              </Button>
            </Empty>
          )}
          <Row gutter={[24, 24]}>
            {devices.map((item) => (
              <Col key={item.uid} span={8} xs={24} sm={12} md={12} lg={8}>
                <div className={styles.item}>
                  <DeviceCard device={item} />
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </Spin>
      <DeviceEdit
        open={open}
        onOk={actions.setFalse}
        onCancel={actions.setFalse}
      />
    </>
  );
}
