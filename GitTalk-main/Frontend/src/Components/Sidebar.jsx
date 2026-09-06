import { useState, useEffect } from 'react';
import * as api from '../api';

const Sidebar = ({
    showNewChatButton = false,
    currentRepoName = null,
    onChatClick,
    onNewChat,
    onLogout,
    user,
    isSidebarOpen,
    onCloseSidebar
}) => {
    const [chats, setChats] = useState([]);


    // Load chats from API
    const loadChats = async () => {
        try {
            const { data } = await api.getUserChats();
            // Data is array of { repoName: "..." }
            // API returns objects with repoName property based on my controller change
            setChats(data);
        } catch (error) {
            console.error('Failed to load chats', error);
        }
    };

    useEffect(() => {
        if (user) {
            loadChats();
        }
    }, [user, currentRepoName]); // Reload when user changes or current repo changes

    const handleChatClick = (repoName) => {
        if (onChatClick) {
            onChatClick(repoName);
        }
        if (onCloseSidebar) {
            onCloseSidebar();
        }
    };

    return (
        <>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
                    onClick={onCloseSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <div className={`absolute left-0 top-0 z-[60] h-full w-80 shrink-0 transform bg-zinc-surface border-r border-zinc-border transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>
                <div className="flex flex-col h-full p-4">
                    <div className="flex items-center justify-between mb-8 px-2">
                        <p className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">RepoTalk</p>
                        <span
                            className="material-symbols-outlined text-slate-400 cursor-pointer md:hidden"
                            onClick={onCloseSidebar}
                        >
                            close
                        </span>
                    </div>

                    {/* New Chat Button - Only shown if showNewChatButton is true */}
                    {showNewChatButton && (
                        <button
                            onClick={onNewChat}
                            className="w-full mb-4 bg-gradient-to-r from-primary to-emerald-400 hover:to-emerald-300 text-background-dark font-bold p-3 rounded-xl transition-all shadow-lg shadow-primary/20"
                        >
                            + New Chat
                        </button>
                    )}

                    {/* Recent Chats / Previous Chats */}
                    <div className="flex-1 overflow-y-auto">
                        <h3 className="text-slate-400 text-sm font-semibold mb-3 px-2">
                            {showNewChatButton ? 'Previous Chats' : 'Recent Chats'}
                        </h3>
                        <div className="space-y-2">
                            {chats.map((chat, index) => (
                                <div
                                    key={index}
                                    onClick={() => handleChatClick(chat.repoName)}
                                    className={`p-3 rounded-lg cursor-pointer transition-colors ${chat.repoName === currentRepoName
                                        ? 'bg-primary/20 border border-primary/30'
                                        : 'bg-zinc-800/50 hover:bg-zinc-700/50'
                                        }`}
                                >
                                    <p className="text-white text-sm font-medium truncate">{chat.repoName}</p>
                                    {/* Removed message count and time for now as API simplified */}
                                </div>
                            ))}
                            {chats.length === 0 && (
                                <p className="text-slate-500 text-sm px-2">
                                    {showNewChatButton ? 'No previous chats' : 'No recent chats'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* User Info */}
                    <div className="pt-4 border-t border-zinc-border mt-auto">
                        <div className="flex items-center gap-3 px-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-emerald-300 flex items-center justify-center text-[10px] font-bold text-background-dark">
                                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate">{user?.name || 'User'}</p>
                            </div>
                            <span
                                onClick={onLogout}
                                className="material-symbols-outlined text-slate-400 text-[18px] cursor-pointer hover:text-red-400 transition-colors"
                                title="Logout"
                            >
                                logout
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
