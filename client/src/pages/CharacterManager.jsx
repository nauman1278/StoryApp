import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function CharacterManager() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [characters, setCharacters] = useState([]);
    
    // Form state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [newCharName, setNewCharName] = useState('');
    const [newCharLock, setNewCharLock] = useState('');

    useEffect(() => {
        axios.get(`http://localhost:5000/api/projects/${id}`).then(res => setProject(res.data));
        fetchCharacters();
    }, [id]);

    const fetchCharacters = () => {
        axios.get(`http://localhost:5000/api/projects/${id}/characters`).then(res => setCharacters(res.data));
    };

    const handleAutoExtract = async () => {
        const toastId = toast.loading('Analyzing story with Groq AI...');
        try {
            await axios.post(`http://localhost:5000/api/projects/${id}/characters/extract`);
            toast.success('Characters extracted successfully!', { id: toastId });
            fetchCharacters();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Extraction failed. Make sure GROQ_API_KEY is in server/.env', { id: toastId });
        }
    };

    const handleAddCharacter = async (e) => {
        e.preventDefault();
        if (!newCharName.trim() || !newCharLock.trim()) return toast.error('Both fields are required');
        
        try {
            await axios.post(`http://localhost:5000/api/projects/${id}/characters`, {
                name: newCharName.trim(),
                description: 'Main character',
                appearanceLock: newCharLock.trim()
            });
            toast.success('Character added!');
            setNewCharName('');
            setNewCharLock('');
            setIsFormOpen(false);
            fetchCharacters();
        } catch (error) {
            toast.error(error.response?.data?.error || 'Failed to add character');
        }
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Character Manager</h2>
                    <p className="text-slate-500 text-sm mt-1">Define appearances so AI generated images keep characters consistent across scenes.</p>
                </div>
                <button onClick={() => navigate(`/projects/${id}`)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Overview
                </button>
            </div>

            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-slate-800">Project Characters</h3>
                <div className="flex gap-4">
                    <button 
                        onClick={handleAutoExtract}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all font-semibold flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Auto-Extract (AI)
                    </button>
                    <button 
                        onClick={() => setIsFormOpen(!isFormOpen)}
                        className="bg-white border border-slate-300 text-slate-700 px-6 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 transition-all font-semibold"
                    >
                        {isFormOpen ? 'Cancel' : '+ Manual Add'}
                    </button>
                </div>
            </div>

            {isFormOpen && (
                <form onSubmit={handleAddCharacter} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-slate-200 animate-fade-in space-y-4">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Character Name</label>
                            <input 
                                type="text"
                                value={newCharName}
                                onChange={e => setNewCharName(e.target.value)}
                                placeholder="e.g. Tina"
                                className="w-full border border-slate-300 rounded-xl p-3 focus:ring-blue-500 focus:border-blue-500 bg-slate-50"
                            />
                            <p className="text-xs text-slate-500 mt-2">Must match exactly how they are named in your story script!</p>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Appearance Lock (Prompt Injection)</label>
                            <textarea 
                                value={newCharLock}
                                onChange={e => setNewCharLock(e.target.value)}
                                placeholder="e.g. 25 year old woman, curly red hair, green eyes, wearing a yellow raincoat"
                                className="w-full border border-slate-300 rounded-xl p-3 h-24 focus:ring-blue-500 focus:border-blue-500 bg-slate-50 resize-none"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-slate-800 text-white px-8 py-2.5 rounded-xl font-bold hover:bg-slate-700 transition-colors">
                            Save Character
                        </button>
                    </div>
                </form>
            )}

            {characters.length === 0 && !isFormOpen && (
                <div className="bg-white/50 backdrop-blur-md p-10 rounded-2xl border-2 border-dashed border-slate-300 text-center">
                    <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <h4 className="text-lg font-bold text-slate-700 mb-2">No Characters Defined</h4>
                    <p className="text-slate-500 max-w-md mx-auto">Add characters here to inject their physical appearance into image prompts whenever their name is mentioned in a scene.</p>
                </div>
            )}

            <div className="grid gap-6">
                {characters.map(char => (
                    <div key={char.id} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-48">
                            <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">Name</div>
                            <div className="text-xl font-black text-slate-800">{char.name}</div>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-1">Appearance Lock</div>
                            <div className="bg-indigo-50 text-indigo-900 p-4 rounded-xl border border-indigo-100 font-mono text-sm">
                                {char.appearanceLock}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {characters.length > 0 && (
                <div className="flex justify-end mt-8">
                    <button onClick={() => navigate(`/projects/${id}/images`)} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2">
                        Next Step: Image Prompts &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}
