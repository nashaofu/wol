import { Suspense } from 'react';
import { Layout } from 'antd';
import NProgress from '@/components/NProgress';
import Header from '@/components/Header';
import Home from '@/components/Home';
import styles from './index.module.less';

export default function Root() {
  return (
    <Suspense fallback={<NProgress />}>
      <Layout className={styles.root}>
        <Header />
        <Home />
      </Layout>
    </Suspense>
  );
}
