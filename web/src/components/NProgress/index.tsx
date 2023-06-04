import { useEffect } from 'react';
import { start, done } from 'nprogress';
import 'nprogress/nprogress.css';
import './index.less';

export default function NProgress() {
  useEffect(() => {
    start();
    return () => {
      done();
    };
  }, []);

  return null;
}
