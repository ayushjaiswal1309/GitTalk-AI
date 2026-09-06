import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import React from 'react'; // Ensure React is imported if needed, or just toast
import * as api from '../api';
import Sidebar from './Sidebar';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/atom-one-dark.css'; // Dark theme for code
import toast from 'react-hot-toast';

const ChatInterface = ({ onLogout, user }) => {
    // We might have :repoId (legacy/direct) OR :owner/:repo/:branch (new)
    const { repoId: paramRepoId, owner, repo, branch } = useParams();
    const navigate = useNavigate();

    // Construct the full ID. Priority: new params -> old param
    // If we have owner/repo/branch, combine them.
    // If not, use paramRepoId (which might be the full string if passed directly)
    const repoId = (owner && repo && branch)
        ? `${owner}/${repo}/${branch}`
        : paramRepoId;

    useEffect(() => {
        console.log("ChatInterface Params:", { owner, repo, branch, paramRepoId, computedRepoId: repoId });
    }, [owner, repo, branch, paramRepoId, repoId]);

    // For display title
    const displayTitle = repoId;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Load messages for current repo
    useEffect(() => {
        const loadHistory = async () => {
            if (!repoId) return;
            try {
                const { data } = await api.getHistory(repoId);
                if (data && Array.isArray(data)) {
                    // Transform backend messages to UI format
                    const formattedMessages = [];
                    data.forEach((item, index) => {
                        formattedMessages.push({
                            id: `user-${index}`,
                            sender: 'user',
                            text: item.userQuery,
                            timestamp: item.createdAt
                        });
                        formattedMessages.push({
                            id: `ai-${index}`,
                            sender: 'ai',
                            text: item.botAnswer,
                            referencedFiles: item.referencedFiles, // Include files
                            timestamp: item.createdAt
                        });
                    });
                    setMessages(formattedMessages);
                } else {
                    setMessages([]);
                }
            } catch (err) {
                console.error('Failed to load history', err);
            }
        };
        loadHistory();
    }, [repoId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: inputText,
            timestamp: new Date().toISOString()
        };

        // Optimistic update
        setMessages(prev => [...prev, userMessage]);

        const query = inputText;
        setInputText("");
        setIsLoading(true); // Start loading

        try {
            // Call Backend
            const { data } = await api.saveMessage(repoId, {
                userQuery: query,
            });

            // Add the AI response from backend to UI
            const aiMessage = {
                id: Date.now() + 1,
                sender: 'ai',
                text: data.botAnswer,
                referencedFiles: data.referencedFiles, // Capture sources from backend response
                timestamp: new Date().toISOString(),
                animate: true // Enable Typewriter effect
            };

            setMessages(prev => [...prev, aiMessage]);

        } catch (err) {
            console.error(err);
            toast.error('Failed to send message');
        } finally {
            setIsLoading(false); // Stop loading
        }
    };

    const loadChat = (selectedRepoId) => {
        // Since selectedRepoId is already "owner/repo/branch" string from Sidebar
        navigate(`/chat/${selectedRepoId}`);
    };

    const goToDashboard = () => {
        navigate('/');
    };

    return (
        <div className="relative flex h-screen w-full flex-col md:flex-row overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
            {/* Sidebar - With New Chat button in ChatInterface */}
            <Sidebar
                showNewChatButton={true}
                currentRepoName={repoId} // Pass full ID
                onChatClick={loadChat}
                onNewChat={goToDashboard}
                onLogout={onLogout}
                user={user}
                isSidebarOpen={isSidebarOpen}
                onCloseSidebar={() => setIsSidebarOpen(false)}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full relative w-full md:w-auto min-w-0">
                <header className="flex items-center justify-between bg-background-light dark:bg-background-dark border-b border-zinc-border px-4 py-3 z-30 shrink-0">
                    <button className="p-2 -ml-2 text-slate-600 dark:text-slate-300 md:hidden" onClick={toggleSidebar}>
                        <span className="material-symbols-outlined">menu</span>
                    </button>
                    <div className="flex flex-col items-center mx-auto md:mx-0 md:flex-row md:gap-4 justify-center md:items-baseline">
                        <h2 className="text-slate-900 dark:text-white text-sm font-bold leading-tight">{displayTitle}</h2>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                    {messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-slate-300 mb-2">Start chatting about {displayTitle}</h3>
                                <p className="text-slate-500">Ask questions about the codebase and get AI-powered insights</p>
                            </div>
                        </div>
                    ) : (
                        messages.map((message) => (
                            <MessageBubble key={message.id} message={message} />
                        ))
                    )}

                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <div className="size-8 shrink-0 rounded-lg flex items-center justify-center shadow-lg bg-primary shadow-primary/20">
                                <span className="material-symbols-outlined text-white font-bold text-[18px] animate-pulse">
                                    smart_toy
                                </span>
                            </div>
                            <div className="flex flex-col gap-2 items-start">
                                <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                                    RepoTalk AI
                                </p>
                                <div className="text-[14px] leading-relaxed rounded-2xl px-4 py-3 font-medium shadow-lg bg-zinc-surface border border-zinc-border text-slate-100 shadow-sm rounded-tl-none">
                                    <div className="flex gap-1 items-center h-5">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <div className="p-4 bg-background-dark/80 backdrop-blur-md border-t border-zinc-border z-40 shrink-0">
                    <div className="flex items-end gap-2 bg-zinc-surface rounded-2xl p-2 border border-zinc-border shadow-lg">
                        <textarea
                            ref={(el) => {
                                // Combined ref mostly for adjusting height
                                if (el) {
                                    el.style.height = 'auto';
                                    el.style.height = Math.min(el.scrollHeight, 240) + 'px'; // Max height 240px (approx 10 lines)
                                }
                            }}
                            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-200 py-3 resize-none max-h-60 placeholder:text-slate-500 focus:outline-none custom-scrollbar"
                            placeholder="Ask about the codebase..."
                            rows={1}
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage();
                                }
                            }}
                        />
                        <button className="size-10 rounded-xl bg-primary text-background-dark flex items-center justify-center shadow-lg hover:bg-primary-dark mb-0.5" onClick={handleSendMessage}>
                            <span className="material-symbols-outlined text-[20px] font-bold">send</span>
                        </button>
                    </div>
                </div>
            </div >
        </div >
    );
};

// Extracted Message Bubble Component with Typewriter Effect
const MessageBubble = ({ message }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    useEffect(() => {
        // If it's an AI message AND marked for animation, start typing
        if (message.sender === 'ai' && message.animate) {
            setIsTyping(true);
            let index = -1;
            const text = message.text || "";

            // Clear initially
            setDisplayedText("");

            const intervalId = setInterval(() => {
                index++;
                if (index < text.length) {
                    setDisplayedText((prev) => prev + text.charAt(index));
                } else {
                    clearInterval(intervalId);
                    setIsTyping(false);
                }
            }, 5); // Speed: 5ms per char

            return () => clearInterval(intervalId);
        } else {
            // Otherwise show full text immediately
            setDisplayedText(message.text || "");
            setIsTyping(false);
        }
    }, [message.text, message.animate, message.sender]);

    // Construct the UI which is same as before but uses displayedText
    return (
        <div className={`flex items-start gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''} group`}>
            <div className={`size-8 shrink-0 rounded-lg flex items-center justify-center shadow-lg ${message.sender === 'user'
                ? 'bg-slate-700'
                : 'bg-primary shadow-primary/20'
                }`}>
                <span className="material-symbols-outlined text-white font-bold text-[18px]">
                    {message.sender === 'user' ? 'person' : 'smart_toy'}
                </span>
            </div>
            <div className={`flex flex-col gap-2 max-w-[85%] ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2">
                    <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                        {message.sender === 'user' ? 'You' : 'RepoTalk AI'}
                    </p>
                    <button
                        onClick={() => {
                            navigator.clipboard.writeText(message.text);
                            toast.success('Copied to clipboard');
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-500 hover:text-primary"
                        title="Copy message"
                    >
                        <span className="material-symbols-outlined text-[18px]">content_copy</span>
                    </button>
                </div>
                <div className={`text-[14px] leading-relaxed rounded-2xl px-4 py-3 font-medium shadow-lg whitespace-pre-wrap ${message.sender === 'user'
                    ? 'bg-primary text-background-dark shadow-primary/10 rounded-tr-none overflow-hidden'
                    : 'bg-zinc-surface border border-zinc-border text-slate-100 shadow-sm rounded-tl-none overflow-hidden'
                    }`}>
                    <ReactMarkdown
                        rehypePlugins={[rehypeHighlight]}
                        components={{
                            code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                    <div className="relative group/code my-4 rounded-lg overflow-hidden border border-white/10 bg-[#1e1e1e] text-slate-200">
                                        <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/10">
                                            <span className="text-xs text-slate-400 font-mono">{match[1]}</span>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                                                    toast.success('Code copied!');
                                                }}
                                                className="opacity-0 group-hover/code:opacity-100 transition-opacity text-slate-400 hover:text-white"
                                                title="Copy code"
                                            >
                                                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                            </button>
                                        </div>
                                        <div className="p-4 overflow-x-auto">
                                            <code className={`${className} !bg-transparent !p-0`} {...props}>
                                                {children}
                                            </code>
                                        </div>
                                    </div>
                                ) : (
                                    <code className={`${className} bg-black/20 px-1.5 py-0.5 rounded text-sm font-mono text-inherit`} {...props}>
                                        {children}
                                    </code>
                                );
                            }
                        }}
                    >
                        {displayedText + (isTyping ? " |" : "")}
                    </ReactMarkdown>

                    {/* Referenced Files Section - Only show when NOT typing or typing finished */}
                    {!isTyping && message.sender === 'ai' && message.referencedFiles && message.referencedFiles.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-zinc-border">
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">
                                Referenced Files:
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {message.referencedFiles.map((file, idx) => (
                                    <span key={idx} className="flex items-center gap-1.5 text-[13px] bg-black/20 text-slate-300 px-2.5 py-1.5 rounded-md border border-white/5 hover:bg-black/40 transition-colors">
                                        <span className="material-symbols-outlined text-[16px] text-primary">description</span>
                                        {file.split('/').pop()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;