import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function StoryEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [scenes, setScenes] = useState([]);
    const [fullStory, setFullStory] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:5000/api/projects/${id}`).then(res => setProject(res.data));
        fetchScenes();
    }, [id]);

    const fetchScenes = () => {
        axios.get(`http://localhost:5000/api/projects/${id}/scenes`).then(res => setScenes(res.data));
    };

    const handleSplitStory = async () => {
        if (!fullStory.trim()) return;

        const toastId = toast.loading('Analyzing story and generating scenes with Groq AI...');
        try {
            await axios.post(`http://localhost:5000/api/projects/${id}/scenes/extract`, { fullStory });
            toast.success('Scenes generated successfully!', { id: toastId });
            setFullStory('');
            fetchScenes();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Extraction failed. Make sure GROQ_API_KEY is in server/.env', { id: toastId });
        }
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">1. Story & Script</h2>
                    <p className="text-slate-500 text-sm mt-1">Enter your story text and we will split it into manageable visual scenes.</p>
                </div>
                <button onClick={() => navigate(`/projects/${id}`)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Overview
                </button>
            </div>

            {scenes.length === 0 && (
                <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-100">
                    <h3 className="text-xl font-bold mb-4 text-slate-800">Enter Full Story</h3>
                    <textarea 
                        className="w-full h-72 p-5 border border-slate-300 rounded-xl font-mono bg-slate-50 focus:bg-white focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner text-slate-700 leading-relaxed"
                        value={fullStory}
                        onChange={(e) => setFullStory(e.target.value)}
                        placeholder="Once upon a time..."
                    />
                    <div className="mt-6 flex justify-end">
                        <button onClick={handleSplitStory} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all font-semibold">
                            Split into Scenes &rarr;
                        </button>
                    </div>
                </div>
            )}

            {scenes.length > 0 && (
                <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-slate-800">Generated Scenes</h3>
                            <span className="bg-blue-100 text-blue-700 font-bold px-3 py-1 rounded-full text-sm">{scenes.length}</span>
                        </div>
                        <button onClick={() => navigate(`/projects/${id}/characters`)} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2">
                            Next Step: Characters &rarr;
                        </button>
                    </div>

                    <div className="grid gap-4">
                        {scenes.map(scene => (
                            <div key={scene.id} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
                                <div className="flex justify-between mb-2">
                                    <div className="font-bold text-slate-400">SCENE {scene.sceneNumber}</div>
                                </div>
                                <div className="text-slate-800 font-medium leading-relaxed">{scene.script}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
