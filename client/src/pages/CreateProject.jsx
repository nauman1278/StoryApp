import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateProject() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        title: '',
        language: 'English',
        aspectRatio: '16:9',
        storyInputMode: 'Full',
        visualStyle: 'Cinematic'
    });

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/projects', formData);
            navigate(`/projects/${res.data.id}`);
        } catch (err) {
            console.error(err);
            alert('Failed to create project');
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-100">
            <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8">Create New Project</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name <span className="text-slate-400 font-normal">(internal folder name)</span></label>
                    <input required type="text" name="name" value={formData.name} onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm border p-3 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50"
                        placeholder="tinas_story" />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Story Title</label>
                    <input required type="text" name="title" value={formData.title} onChange={handleChange}
                        className="mt-1 block w-full rounded-xl border-slate-300 shadow-sm border p-3 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white/50"
                        placeholder="Tina's Story" />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Language</label>
                        <select name="language" value={formData.language} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-xl p-3 bg-white/50 focus:ring-blue-500 focus:border-blue-500 transition-all">
                            <option>English</option>
                            <option>Hindi</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Aspect Ratio</label>
                        <select name="aspectRatio" value={formData.aspectRatio} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-xl p-3 bg-white/50 focus:ring-blue-500 focus:border-blue-500 transition-all">
                            <option>16:9</option>
                            <option>9:16</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Story Input Mode</label>
                        <select name="storyInputMode" value={formData.storyInputMode} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-xl p-3 bg-white/50 focus:ring-blue-500 focus:border-blue-500 transition-all">
                            <option value="Full">Full Story Script</option>
                            <option value="Manual">Manual Scene Creation</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Visual Style</label>
                        <select name="visualStyle" value={formData.visualStyle} onChange={handleChange} className="mt-1 block w-full border border-slate-300 rounded-xl p-3 bg-white/50 focus:ring-blue-500 focus:border-blue-500 transition-all">
                            <option value="Cinematic">Cinematic Illustrated Story</option>
                            <option value="Vintage">Vintage Language-Learning Story</option>
                        </select>
                    </div>
                </div>

                <div className="pt-6 flex justify-end">
                    <button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all font-semibold text-lg">
                        Create Project
                    </button>
                </div>
            </form>
        </div>
    );
}
