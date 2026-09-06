import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import * as api from '../api';
import { toast } from 'react-hot-toast';

const Dashboard = ({ onLogout, user }) => {
    const [githubUrl, setGithubUrl] = useState('');
    const [branch, setBranch] = useState('main');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    const handleStartChat = async () => {
        if (!githubUrl.trim()) return;
        setIsLoading(true);

        try {
            // 1. Ingest Repo
            await api.ingestRepo({ repoUrl: githubUrl, branch });

            // 2. Parse details for navigation
            const cleanUrl = githubUrl.replace(/\/$/, "");
            const urlParts = cleanUrl.split('/');
            if (urlParts.length < 2) throw new Error("Invalid URL");

            const repo = urlParts[urlParts.length - 1];
            const owner = urlParts[urlParts.length - 2];

            // 3. Navigate
            navigate(`/chat/${owner}/${repo}/${encodeURIComponent(branch)}`);
        } catch (e) {
            console.error(e);
            toast.error("Failed to ingest repository. Please check url and branch again.");
        } finally {
            setIsLoading(false);
        }
    };

    const loadChat = (repoId) => {
        // repoId should now be "owner/repo/branch"
        // We need to split it to navigate correctly, OR change App.jsx to match full string.
        // Easiest is to navigate to the constructed path. 
        // NOTE: The Sidebar passes the full repoId string.
        navigate(`/chat/${repoId}`);
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="relative flex h-screen w-full flex-col md:flex-row overflow-hidden bg-[#0f0f12] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0f0f12] to-black text-white font-display">
            {/* Sidebar - No New Chat button in Dashboard */}
            <Sidebar
                showNewChatButton={false}
                currentRepoName={null}
                onChatClick={loadChat}
                onLogout={onLogout}
                user={user}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative w-full md:w-auto min-w-0">
                {/* Header */}
                <header className="flex items-center justify-between p-4 border-b border-white/10 shrink-0">
                    <button className="p-2 -ml-2 text-slate-300 md:hidden" onClick={toggleSidebar}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <h1 className="text-2xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent md:ml-0 ml-auto mr-auto md:mr-0">
                        RepoTalk
                    </h1>
                    <div className="hidden md:flex items-center gap-4">
                        <span className="text-sm text-slate-400">Welcome, {user?.name || 'User'}</span>
                        <button
                            onClick={onLogout}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </header>

                {/* Main Content */}
                <main className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
                    <div className="w-full max-w-2xl">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-4">
                                Analyze Your Codebase
                            </h2>
                            <p className="text-slate-400 text-lg">
                                Paste a GitHub repository URL and start chatting with your code
                            </p>
                        </div>

                        <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">
                                        GitHub Repository URL
                                    </label>
                                    <input
                                        type="url"
                                        value={githubUrl}
                                        onChange={(e) => setGithubUrl(e.target.value)}
                                        placeholder="https://github.com/username/repository"
                                        className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleStartChat();
                                            }
                                        }}
                                    />
                                </div>

                                {/* [NEW] Branch Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-slate-400 mb-2">
                                        Branch Name
                                    </label>
                                    <input
                                        type="text"
                                        value={branch}
                                        onChange={(e) => setBranch(e.target.value)}
                                        placeholder="main"
                                        className="w-full p-4 bg-black/40 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                                    />
                                </div>

                                <button
                                    onClick={handleStartChat}
                                    disabled={!githubUrl.trim() || isLoading}
                                    className="w-full bg-gradient-to-r from-primary to-emerald-400 hover:to-emerald-300 text-background-dark font-bold p-4 rounded-xl transition-all shadow-lg shadow-primary/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-background-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Ingesting Repository...</span>
                                        </>
                                    ) : (
                                        'Start Chat'
                                    )}
                                </button>

                                {isLoading && (
                                    <div className="text-center animate-pulse">
                                        <p className="text-sm text-emerald-400 font-medium">
                                            This process may take a few minutes depending on the repository size.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
