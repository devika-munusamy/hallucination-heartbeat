import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import OverviewPage    from './pages/OverviewPage';
import TracesPage      from './pages/TracesPage';
import AlertsPage      from './pages/AlertsPage';
import AnalyticsPage   from './pages/AnalyticsPage';
import ReplayPage      from './pages/ReplayPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-[#04060b] text-slate-200 selection:bg-blue-500/30">
        {/* Ambient glows */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 blur-[140px] pointer-events-none"></div>
        <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/5 blur-[120px] pointer-events-none"></div>

        <Sidebar />

        <main className="flex-1 overflow-y-auto px-6 lg:px-12 py-10 relative z-10">
          <Routes>
            <Route path="/"          element={<OverviewPage />} />
            <Route path="/traces"    element={<TracesPage />} />
            <Route path="/alerts"    element={<AlertsPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/replay"    element={<ReplayPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
