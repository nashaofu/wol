import { Col, Row, Spin } from 'antd';
import { useDevices } from '@/hooks/useDevices';
import Device from '@/components/Device';
import styles from './index.module.less';

export default function Home() {
  const { data: devices = [], isLoading } = useDevices();

  return (
    <Spin spinning={isLoading} size="large">
      <div className={styles.home}>
        <Row gutter={[24, 24]}>
          {devices.map((item) => (
            <Col key={item.uid} span={8} xs={24} sm={24} md={12} lg={8}>
              <div className={styles.item}>
                <Device device={item} />
              </div>
            </Col>
          ))}
        </Row>
        <div className={styles.container} />
      </div>
    </Spin>
  );
}
