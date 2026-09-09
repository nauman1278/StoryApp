import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function VoiceStudio() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [scenes, setScenes] = useState([]);
    
    // Voice settings state
    const [provider, setProvider] = useState('mock');
    const [voices, setVoices] = useState([]);
    const [selectedVoice, setSelectedVoice] = useState('');
    const [isFetchingVoices, setIsFetchingVoices] = useState(false);

    useEffect(() => {
        axios.get(`/api/projects/${id}`).then(res => {
            setProject(res.data);
            if (res.data.ttsProvider) {
                setProvider(res.data.ttsProvider);
                setSelectedVoice(res.data.selectedVoiceId || '');
            }
        });
        fetchScenes();
    }, [id]);

    useEffect(() => {
        if (!provider) return;
        setIsFetchingVoices(true);
        axios.get(`/api/voices?provider=${provider}`)
            .then(res => setVoices(res.data))
            .catch(err => toast.error('Failed to fetch voices: ' + (err.response?.data?.error || err.message)))
            .finally(() => setIsFetchingVoices(false));
    }, [provider]);

    const fetchScenes = () => {
        axios.get(`/api/projects/${id}/scenes`).then(res => setScenes(res.data));
    };

    const handleSaveSettings = async () => {
        try {
            await axios.put(`/api/projects/${id}`, {
                ttsProvider: provider,
                selectedVoiceId: selectedVoice
            });
            toast.success('Voice settings saved!');
        } catch (error) {
            toast.error('Failed to save settings');
        }
    };

    const handlePreviewVoice = async () => {
        if (!selectedVoice) return toast.error('Select a voice first');
        const toastId = toast.loading('Generating preview...');
        try {
            const res = await axios.post(`/api/voices/preview`, {
                provider,
                voiceId: selectedVoice,
                text: "Hello! This is a preview of how my voice sounds for your story."
            });
            
            toast.dismiss(toastId);
            const audio = new Audio(`${res.data.previewUrl}`);
            audio.play();
        } catch (error) {
            toast.error('Failed to generate preview', { id: toastId });
        }
    };

    const [activeJob, setActiveJob] = useState(null);
    const [progress, setProgress] = useState(0);
    const [jobStatus, setJobStatus] = useState('');

    useEffect(() => {
        if (!activeJob) return;

        const evtSource = new EventSource(`/api/jobs/${activeJob}/events`);
        
        evtSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            setProgress(data.progress || 0);
            setJobStatus(data.status || '');

            if (data.status === 'COMPLETED' || data.status === 'FAILED') {
                evtSource.close();
                setActiveJob(null);
                fetchScenes(); // refresh UI to show Ready
                if (data.status === 'COMPLETED') {
                    toast.success('All audio generated successfully!');
                } else {
                    toast.error('Audio generation failed.');
                }
            }
        };

        return () => evtSource.close();
    }, [activeJob]);

    const handleGenerateAllAudio = async () => {
        if (!selectedVoice) return toast.error('Please select and save a voice first.');
        try {
            const res = await axios.post(`/api/projects/${id}/render/audio`);
            setActiveJob(res.data.jobId);
            setProgress(0);
            setJobStatus('PROCESSING');
            toast.success('Audio generation started!');
        } catch (error) {
            toast.error('Failed to start audio generation: ' + (error.response?.data?.error || error.message));
        }
    };

    if (!project) return <div>Loading...</div>;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Voice Studio: <span className="text-blue-600">{project.title}</span></h2>
                <button onClick={() => navigate(`/projects/${id}`)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Overview
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">TTS Provider</label>
                        <select 
                            value={provider} 
                            onChange={(e) => setProvider(e.target.value)}
                            className="block w-full border border-slate-300 rounded-xl p-3 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm"
                        >
                            <option value="mock">Mock TTS (Local, no credits)</option>
                            <option value="edge">Microsoft Edge (Free)</option>
                            <option value="elevenlabs">ElevenLabs (API Key required)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Select Voice</label>
                        <select 
                            value={selectedVoice} 
                            onChange={(e) => setSelectedVoice(e.target.value)}
                            disabled={isFetchingVoices}
                            className="block w-full border border-slate-300 rounded-xl p-3 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm disabled:opacity-50"
                        >
                            <option value="">-- Choose a voice --</option>
                            {voices.map(v => (
                                <option key={v.id} value={v.id}>{v.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="flex-1 flex flex-col justify-center gap-4 bg-slate-50 p-6 rounded-xl border border-slate-200">
                    <h3 className="font-bold text-slate-700 mb-2">Voice Actions</h3>
                    <div className="flex gap-4">
                        <button 
                            onClick={handlePreviewVoice}
                            disabled={activeJob !== null}
                            className="flex-1 bg-white border border-slate-300 text-slate-700 px-4 py-2.5 rounded-xl shadow-sm hover:bg-slate-50 hover:-translate-y-0.5 transition-all font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Preview Voice
                        </button>
                        <button 
                            onClick={handleSaveSettings}
                            disabled={activeJob !== null}
                            className="flex-1 bg-blue-100 text-blue-700 border border-blue-200 px-4 py-2.5 rounded-xl shadow-sm hover:bg-blue-200 hover:-translate-y-0.5 transition-all font-semibold disabled:opacity-50"
                        >
                            Save Settings
                        </button>
                    </div>
                    
                    <button 
                        onClick={handleGenerateAllAudio}
                        disabled={activeJob !== null}
                        className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:-translate-y-0.5 transition-all font-semibold text-lg flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {activeJob ? 'Generating Audio...' : 'Generate Audio for All Scenes'}
                    </button>
                    
                    {activeJob && (
                        <div className="mt-4 bg-white p-4 rounded-xl shadow-inner border border-slate-200">
                            <div className="flex justify-between text-sm mb-2 font-bold text-slate-700">
                                <span>Status: {jobStatus}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                                <div className="bg-purple-600 h-3 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="font-bold text-slate-800 mb-4">Scene Audio Status</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {scenes.map(scene => (
                        <div key={scene.id} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center ${scene.audioPath ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200'}`}>
                            <span className="font-bold text-slate-700 mb-1">Scene {scene.sceneNumber}</span>
                            {scene.audioPath ? (
                                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Ready</span>
                            ) : (
                                <span className="text-xs font-semibold text-slate-400">Pending</span>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {scenes.length > 0 && scenes.every(s => s.audioPath) && (
                <div className="flex justify-end mt-8">
                    <button onClick={() => navigate(`/projects/${id}/render`)} className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2">
                        Next Step: Render Video &rarr;
                    </button>
                </div>
            )}
        </div>
    );
}
