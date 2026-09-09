import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

export default function ProjectOverview() {
    const { id } = useParams();
    const [project, setProject] = useState(null);
    const [scenes, setScenes] = useState([]);

    useEffect(() => {
        const fetchProject = async () => {
            const res = await axios.get(`http://localhost:5000/api/projects/${id}`);
            setProject(res.data);
            const scenesRes = await axios.get(`http://localhost:5000/api/projects/${id}/scenes`);
            setScenes(scenesRes.data);
        };
        fetchProject();
    }, [id]);

    if (!project) return <div>Loading...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                    <div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">{project.title}</h2>
                        <div className="mt-2 flex items-center gap-3">
                            <span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-100">{project.language}</span>
                            <span className="bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-semibold border border-indigo-100">{project.visualStyle}</span>
                            <span className="text-slate-400 text-sm">{project.aspectRatio}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="px-4 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-bold border border-emerald-200 shadow-sm">
                            {project.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-4xl font-black text-slate-700">{scenes.length}</div>
                        <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Scenes</div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-4xl font-black text-blue-600">{scenes.filter(s => s.imagePath).length} <span className="text-2xl text-slate-400 font-light">/ {scenes.length}</span></div>
                        <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Images Uploaded</div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-4xl font-black text-indigo-600">{scenes.filter(s => s.audioPath).length} <span className="text-2xl text-slate-400 font-light">/ {scenes.length}</span></div>
                        <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Voices Generated</div>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-4xl font-black text-emerald-600">{scenes.filter(s => s.clipPath).length} <span className="text-2xl text-slate-400 font-light">/ {scenes.length}</span></div>
                        <div className="text-sm font-medium text-slate-500 mt-1 uppercase tracking-wider">Clips Ready</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Link to={`/projects/${project.id}/story`} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all group">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800">1. Story & Script</h3>
                    <p className="text-slate-500 text-sm">Add your story text and split it into scenes.</p>
                </Link>

                <Link to={`/projects/${project.id}/characters`} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-amber-300 hover:-translate-y-1 transition-all group">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800">2. Characters</h3>
                    <p className="text-slate-500 text-sm">Auto-extract or manually lock character appearances.</p>
                </Link>
                
                <Link to={`/projects/${project.id}/images`} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 transition-all group">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800">3. Image Studio</h3>
                    <p className="text-slate-500 text-sm">Generate prompts and upload final scene images.</p>
                </Link>

                <Link to={`/projects/${project.id}/voice`} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 transition-all group">
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800">4. Voice Studio</h3>
                    <p className="text-slate-500 text-sm">Select TTS voice and generate narration.</p>
                </Link>

                <Link to={`/projects/${project.id}/render`} className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:border-emerald-300 hover:-translate-y-1 transition-all group">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-slate-800">5. Render Video</h3>
                    <p className="text-slate-500 text-sm">Compile scenes into the final video.</p>
                </Link>
            </div>
        </div>
    );
}
