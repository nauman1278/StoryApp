import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function ImageStudio() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [scenes, setScenes] = useState([]);
    const [copiedSceneId, setCopiedSceneId] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/projects/${id}`).then(res => setProject(res.data));
        fetchScenes();
    }, [id]);

    const fetchScenes = () => {
        axios.get(`http://localhost:5000/api/projects/${id}/scenes`).then(res => setScenes(res.data));
    };

    const handleImageUpload = async (sceneId, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        
        const toastId = toast.loading('Uploading image...');
        try {
            await axios.post(`http://localhost:5000/api/projects/${id}/scenes/${sceneId}/image`, formData);
            toast.success('Image uploaded successfully', { id: toastId });
            fetchScenes();
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.error || 'Failed to upload image', { id: toastId });
        }
    };

    const handleCopyPrompt = (prompt, sceneId) => {
        navigator.clipboard.writeText(prompt);
        setCopiedSceneId(sceneId);
        setTimeout(() => setCopiedSceneId(null), 5000);
    };

    const handleGeneratePrompts = async () => {
        const toastId = toast.loading('Generating image prompts...');
        try {
            await axios.post(`http://localhost:5000/api/projects/${id}/prompts/generate-all`);
            toast.success('Prompts generated successfully!', { id: toastId });
            fetchScenes();
        } catch (error) {
            toast.error('Failed to generate prompts', { id: toastId });
        }
    };

    if (!project) return <div>Loading...</div>;

    const allImagesUploaded = scenes.length > 0 && scenes.every(s => s.imagePath);

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">3. Image Studio</h2>
                    <p className="text-slate-500 text-sm mt-1">Generate image prompts based on your characters, and upload the final scene illustrations.</p>
                </div>
                <div className="flex items-center gap-4">
                    <button onClick={handleGeneratePrompts} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all font-semibold flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                        Generate All Image Prompts
                    </button>
                    <button onClick={() => navigate(`/projects/${id}`)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Overview
                    </button>
                </div>
            </div>

            <div className="grid gap-6">
                {scenes.map((scene) => (
                    <div key={scene.id} className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-8">
                        <div className="flex-1 space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="font-extrabold text-slate-800 text-lg bg-slate-100 px-3 py-1 rounded-lg">Scene {scene.sceneNumber}</span>
                                {scene.imagePath && <span className="text-xs px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-700">Image Uploaded</span>}
                            </div>
                            
                            <div>
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">Script</div>
                                <p className="text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200">{scene.script}</p>
                            </div>

                            <div>
                                <div className="text-sm font-bold text-indigo-500 uppercase tracking-wider mb-1">Image Prompt</div>
                                {scene.imagePrompt ? (
                                    <div className="relative">
                                        <textarea 
                                            className="w-full h-32 p-4 border border-indigo-200 rounded-xl bg-indigo-50/50 text-sm font-mono text-indigo-900 resize-none focus:outline-none"
                                            defaultValue={scene.imagePrompt}
                                            readOnly
                                        />
                                        <button 
                                            onClick={() => handleCopyPrompt(scene.imagePrompt, scene.id)}
                                            className={`absolute top-2 right-2 p-2 rounded-lg transition-colors text-xs font-bold ${copiedSceneId === scene.id ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                                        >
                                            {copiedSceneId === scene.id ? 'Copied!' : 'Copy'}
                                        </button>
                                    </div>
                                ) : (
                                    <p className="text-slate-400 italic text-sm">No prompt generated. Go to Story Editor to generate prompts.</p>
                                )}
                            </div>
                        </div>

                        <div className="w-full lg:w-72 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 overflow-hidden relative group">
                            {scene.imagePath ? (
                                <img src={`http://localhost:5000/output/${scene.imagePath}?t=${Date.now()}`} alt={`Scene ${scene.sceneNumber}`} className="w-full h-full object-cover" />
                            ) : (
                                <div className="p-8 text-center flex flex-col items-center">
                                    <svg className="w-10 h-10 text-slate-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                    <p className="text-slate-500 font-medium text-sm">Upload Image</p>
                                    <p className="text-slate-400 text-xs mt-1">Requires {project.aspectRatio}</p>
                                </div>
                            )}
                            
                            <div className={`absolute inset-0 bg-slate-900/40 flex items-center justify-center transition-opacity ${scene.imagePath ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                                <label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-lg font-bold text-sm shadow-lg hover:bg-slate-100 transition-colors">
                                    {scene.imagePath ? 'Replace Image' : 'Choose File'}
                                    <input 
                                        type="file" 
                                        accept="image/jpeg,image/png,image/webp" 
                                        className="hidden" 
                                        onChange={(e) => handleImageUpload(scene.id, e.target.files[0])}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {allImagesUploaded && (
                <div className="flex justify-end mt-8">
                    <button onClick={() => navigate(`/projects/${id}/voice`)} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2">
                        Next Step: Voice Studio &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}
