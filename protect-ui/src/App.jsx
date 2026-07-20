import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, AlertTriangle, Lock, EyeOff, Smartphone, Globe } from 'lucide-react';
import TopicPage from './pages/TopicPage';

function Header() {
  return (
    <header className="app-header">
      <div className="container">
        <a href="/" className="back-link">
          <ArrowLeft size={20} />
          Back to GeoTrace
        </a>
      </div>
    </header>
  );
}

function App() {
  return (
    <BrowserRouter basename="/protect-guide">
      <Header />
      <Routes>
        <Route path="/:topicId" element={<TopicPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
