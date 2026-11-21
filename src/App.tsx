import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Landing from '@/pages/Landing';
import Classify from '@/pages/Classify';
import ModelPerformance from '@/pages/ModelPerformance';
import Dashboard from '@/pages/Dashboard';
import History from '@/pages/History';
import About from '@/pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-cream">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/classify" element={<Classify />} />
            <Route path="/model-performance" element={<ModelPerformance />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/history" element={<History />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Landing />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
