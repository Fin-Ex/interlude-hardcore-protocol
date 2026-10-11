import { Navigate, Route, Routes } from 'react-router-dom';
import { GroupPage } from './components/GroupPage';
import { Layout } from './components/Layout';
import { Message } from './components/Message';
import { PacketPage } from './components/PacketPage';
import { DEFAULT_GROUP } from './protocol';

export function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to={`/${DEFAULT_GROUP}`} replace />} />
        <Route path=":group" element={<GroupPage />} />
        <Route path=":group/:direction/:name" element={<PacketPage />} />
        <Route path="*" element={<Message title="Страница не найдена" />} />
      </Route>
    </Routes>
  );
}
