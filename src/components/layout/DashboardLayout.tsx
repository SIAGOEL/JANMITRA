import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';
import { isAuthenticated } from '../../lib/api';

export default function DashboardLayout() {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f6f9fd]">
      <Sidebar />

      <div className="ml-[252px] min-h-screen">
        <div className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <TopNav />
        </div>

        <main className="px-4 py-4 xl:px-5 xl:py-4">
    <Outlet />
</main>
      </div>
    </div>
  );
}