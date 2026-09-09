import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const [projects, setProjects] = useState([]);

    useEffect(() => {
        axios.get('/api/projects')
            .then(res => setProjects(res.data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">Projects</h2>
                <Link to="/create" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all font-medium">
                    + New Project
                </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                    <div key={project.id} className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all p-6 flex flex-col group">
                        <h3 className="text-xl font-bold mb-2 text-slate-800 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                        <div className="text-slate-500 text-sm mb-6 space-y-1">
                            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-400"></span> {project.language} • {project.visualStyle}</p>
                            <p className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> Status: <span className="font-medium text-slate-700">{project.status}</span></p>
                        </div>
                        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                            <Link to={`/projects/${project.id}`} className="text-sm font-semibold text-blue-600 hover:text-indigo-600 transition-colors flex items-center gap-1">
                                Open Project <span className="text-lg leading-none">&rarr;</span>
                            </Link>
                        </div>
                    </div>
                ))}
                
                {projects.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/50 border border-dashed border-slate-300 rounded-2xl">
                        <div className="text-slate-400 mb-2">
                            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002 2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <p className="text-slate-500 font-medium">No projects found. Create one to get started!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
