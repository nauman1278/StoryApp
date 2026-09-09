import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function RenderVideo() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [scenes, setScenes] = useState([]);
    
    // Job progress tracking
    const [activeJob, setActiveJob] = useState(null);
    const [existingVideo, setExistingVideo] = useState(false);
    const [videoUrl, setVideoUrl] = useState('');

    useEffect(() => {
        axios.get(`/api/projects/${id}`).then(res => {
            const proj = res.data;
            setProject(proj);
            const url = `/output/${proj.name}/final/${proj.name}_final.mp4`;
            setVideoUrl(url);
            
            // Check if video already exists
            axios.head(url)
                .then(() => setExistingVideo(true))
                .catch(() => setExistingVideo(false));
        });
        fetchScenes();
    }, [id]);

    const fetchScenes = () => {
        axios.get(`/api/projects/${id}/scenes`).then(res => setScenes(res.data));
    };

    // Subscribes to Server-Sent Events for real-time progress
    useEffect(() => {
        if (!activeJob) return;

        const eventSource = new EventSource(`/api/jobs/${activeJob.id}/events`);
        
        eventSource.onmessage = (e) => {
            const data = JSON.parse(e.data);
            setActiveJob(prev => ({ ...prev, ...data }));
            
            if (data.status === 'COMPLETED' || data.status === 'FAILED') {
                eventSource.close();
                fetchScenes(); // Refresh data to show paths
                if (data.status === 'COMPLETED') {
                    setExistingVideo(true);
                }
            }
        };

        return () => eventSource.close();
    }, [activeJob?.id]);

    const handleRenderVideo = async () => {
        try {
            setExistingVideo(false);
            const res = await axios.post(`/api/projects/${id}/render/video`);
            setActiveJob({ id: res.data.jobId, type: 'RENDER_VIDEO', progress: 0, status: 'PROCESSING' });
        } catch (error) {
            toast.error('Failed to start video rendering: ' + (error.response?.data?.error || error.message));
        }
    };

    if (!project) return <div>Loading...</div>;

    const allImagesUploaded = scenes.every(s => s.imagePath);
    const allAudioGenerated = scenes.every(s => s.audioPath);
    const canRender = allImagesUploaded && allAudioGenerated && scenes.length > 0;

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center bg-white/80 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Render Video: <span className="text-blue-600">{project.title}</span></h2>
                <button onClick={() => navigate(`/projects/${id}`)} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Overview
                </button>
            </div>

            <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl border border-slate-100 flex flex-col items-center justify-center min-h-[400px]">
                {!canRender && !existingVideo && (
                    <div className="text-center space-y-4 max-w-lg">
                        <div className="w-16 h-16 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Cannot Render Yet</h3>
                        <p className="text-slate-500">You must upload all images and generate all audio before rendering the final video.</p>
                        <div className="flex gap-4 justify-center mt-6">
                            <button onClick={() => navigate(`/projects/${id}/images`)} className={`px-4 py-2 rounded-lg font-bold text-sm border ${allImagesUploaded ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-700 border-slate-300'}`}>
                                Images {allImagesUploaded ? '✓' : '✗'}
                            </button>
                            <button onClick={() => navigate(`/projects/${id}/voice`)} className={`px-4 py-2 rounded-lg font-bold text-sm border ${allAudioGenerated ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white text-slate-700 border-slate-300'}`}>
                                Audio {allAudioGenerated ? '✓' : '✗'}
                            </button>
                        </div>
                    </div>
                )}

                {canRender && !activeJob && !existingVideo && (
                    <div className="text-center space-y-6">
                        <h3 className="text-2xl font-bold text-slate-800">Ready to Render!</h3>
                        <p className="text-slate-500">All assets are prepared. FFmpeg will now compile your scenes.</p>
                        <button 
                            onClick={handleRenderVideo}
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-10 py-4 rounded-xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 transition-all font-bold text-lg flex items-center justify-center gap-3 mx-auto"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Start Video Render
                        </button>
                    </div>
                )}

                {activeJob && activeJob.status !== 'COMPLETED' && (
                    <div className="w-full max-w-2xl">
                        <div className="flex justify-between mb-2">
                            <span className="font-bold text-slate-700">{activeJob.status}</span>
                            <span className="font-bold text-blue-600">{activeJob.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-4 mb-4 overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500 ease-out" style={{ width: `${activeJob.progress}%` }}></div>
                        </div>
                        
                        {activeJob.error && (
                            <div className="mt-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl">
                                <span className="font-bold">Error: </span> {activeJob.error}
                            </div>
                        )}
                    </div>
                )}

                {existingVideo && (
                    <div className="w-full max-w-2xl mt-4 text-center space-y-6">
                        <div className="text-xl font-bold text-emerald-600 flex items-center justify-center gap-2">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            Video Rendered Successfully!
                        </div>
                        
                        <video 
                            src={`${videoUrl}?t=${Date.now()}`}
                            controls
                            className="w-full rounded-2xl shadow-lg border border-slate-200"
                        />

                        <div className="flex gap-4 justify-center mt-6">
                            <button 
                                onClick={async (e) => {
                                    e.preventDefault();
                                    const toastId = toast.loading('Starting download...');
                                    try {
                                        const response = await fetch(`${videoUrl}?t=${Date.now()}`);
                                        const blob = await response.blob();
                                        const blobUrl = window.URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = blobUrl;
                                        a.download = `${project.title}_Final.mp4`;
                                        document.body.appendChild(a);
                                        a.click();
                                        a.remove();
                                        window.URL.revokeObjectURL(blobUrl);
                                        toast.success('Download started!', { id: toastId });
                                    } catch (err) {
                                        toast.error('Download failed.', { id: toastId });
                                    }
                                }}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow hover:bg-blue-700 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                                Download Video
                            </button>
                            <button 
                                onClick={handleRenderVideo}
                                className="bg-white border border-slate-300 text-slate-700 px-6 py-3 rounded-xl shadow hover:bg-slate-50 hover:-translate-y-0.5 transition-all font-bold flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                Re-render
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
