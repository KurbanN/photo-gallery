import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from '@/pages/Landing';
import FindMySeat from '@/pages/FindMySeat';
import GuestEvent from '@/pages/GuestEvent';
import EventLiveDisplay from '@/pages/EventLiveDisplay';
import OrganizerLogin from '@/pages/OrganizerLogin';
import Dashboard from '@/pages/Dashboard';
import EventCreate from '@/pages/EventCreate';
import EventManage from '@/pages/EventManage';
import AdminUsers from '@/pages/AdminUsers';

export default function App() {
  const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/e/:slug/live" element={<EventLiveDisplay />} />
        <Route path="/e/:slug/seats" element={<FindMySeat />} />
        <Route path="/e/:slug" element={<GuestEvent />} />
        <Route path="/dashboard/login" element={<OrganizerLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/new" element={<EventCreate />} />
        <Route path="/dashboard/events/:id" element={<EventManage />} />
        <Route path="/dashboard/admin" element={<AdminUsers />} />
        <Route path="/demo" element={<Navigate to="/" replace />} />
        <Route path="/demo/invite" element={<Navigate to="/" replace />} />
        <Route path="/invite/:slug" element={<Navigate to="/" replace />} />
        <Route path="/preview/invitarium" element={<Navigate to="/" replace />} />
        <Route path="/dashboard/events/:id/invite" element={<Navigate to={`/dashboard`} replace />} />
        {/* Старые закладки: одностраничная свадьба → legacy slug */}
        <Route path="/wedding" element={<Navigate to="/e/demo" replace />} />
        <Route path="/e/main" element={<Navigate to="/e/demo" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
