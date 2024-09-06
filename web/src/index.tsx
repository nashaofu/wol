import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { SWRConfig, Cache } from 'swr';
import './styles/index.less';

import ErrorBoundary from './components/ErrorBoundary';
import Wol from './Wol';

function localStorageProvider() {
  const key = 'Wol.app-cache';
  // 初始化时，我们将数据从 `localStorage` 恢复到一个 map 中。
  const map = new Map(JSON.parse(localStorage.getItem(key) || '[]'));

  // 在卸载 app 之前，我们将所有数据写回 `localStorage` 中。
  window.addEventListener('beforeunload', () => {
    const appCache = JSON.stringify(Array.from(map.entries()));
    localStorage.setItem(key, appCache);
  });

  // 我们仍然使用 map 进行读写以提高性能。
  return map as Cache;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <ErrorBoundary>
      <SWRConfig value={{ provider: localStorageProvider }}>
        <Wol />
      </SWRConfig>
    </ErrorBoundary>
  </StrictMode>,
);
