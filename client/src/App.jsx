import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Dashboard from './pages/Dashboard';
import CreateProject from './pages/CreateProject';
import ProjectOverview from './pages/ProjectOverview';
import StoryEditor from './pages/StoryEditor';
import CharacterManager from './pages/CharacterManager';
import ImageStudio from './pages/ImageStudio';
import VoiceStudio from './pages/VoiceStudio';
import RenderVideo from './pages/RenderVideo';

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight">
              StoryVideo<span className="font-light text-slate-400 ml-1">Gen</span>
            </h1>
            <nav>
              <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors">Dashboard</Link>
            </nav>
          </div>
        </header>
        
        <main className="flex-1 w-full max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateProject />} />
            <Route path="/projects/:id" element={<ProjectOverview />} />
            <Route path="/projects/:id/story" element={<StoryEditor />} />
            <Route path="/projects/:id/characters" element={<CharacterManager />} />
            <Route path="/projects/:id/images" element={<ImageStudio />} />
            <Route path="/projects/:id/voice" element={<VoiceStudio />} />
            <Route path="/projects/:id/render" element={<RenderVideo />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
