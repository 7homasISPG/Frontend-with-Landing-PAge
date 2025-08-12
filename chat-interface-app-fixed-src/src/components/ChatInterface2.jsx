import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import InitialView from './InitialView';
import ChatView from './ChatView';
import ChatInput from './ChatInput';
import SourceDisplay from './SourceDisplay';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react'; 

// Configuration
const API_ASK_URL = 'http://localhost:8000/api/ask';
const API_UPLOAD_URL = 'http://localhost:8000/api/upload';

const ChatInterface = ({ 
    startInConversation = false, 
    currentThread = null, 
    onThreadUpdate = null 
}) => {
    // State Management
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [conversationStarted, setConversationStarted] = useState(startInConversation);
    const [currentSources, setCurrentSources] = useState([]);
    const [isSourceOpen, setIsSourceOpen] = useState(false);
    const fileInputRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load thread messages when currentThread changes
    useEffect(() => {
        if (currentThread && currentThread.id) {
            // TODO: Load messages from backend for this thread
            // For now, clear messages when switching threads
            setMessages([]);
            setConversationStarted(startInConversation);
        }
    }, [currentThread, startInConversation]);

    // Auto-open source drawer when citations are added
    useEffect(() => {
        if (currentSources.length > 0) {
            setIsSourceOpen(true);
        }
    }, [currentSources]);

    // Handle sending messages
    const handleSendMessage = async (query) => {
        if (!query.trim() || isLoading) return;
        if (!conversationStarted) setConversationStarted(true);

        const userMessage = { role: 'user', content: { text: query } };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            console.log("Sending query to backend:", query);
            const response = await axios.post(API_ASK_URL, { query });
            const responseData = response.data;

            console.log("Received structured response from backend:", responseData);

            const assistantMessage = { role: 'assistant', content: responseData };
            console.log("Structured as assistant message:", assistantMessage);

            setMessages(prev => [...prev, assistantMessage]);

            // Update sources if available
            if (responseData.citations && responseData.citations.length > 0) {
                setCurrentSources(responseData.citations);
            }

            // Update thread with new message if callback provided
            if (onThreadUpdate && currentThread) {
                const updatedThread = {
                    ...currentThread,
                    lastMessage: query,
                    timestamp: new Date(),
                    messageCount: (currentThread.messageCount || 0) + 2 // user + assistant
                };
                onThreadUpdate(updatedThread);
            }

        } catch (error) {
            console.error('Error fetching response from backend:', error);

            let errorMessageText = 'Sorry, I encountered an error. Please try again.';
            if (error.response) {
                console.error("Backend responded with error:", error.response.data);
                errorMessageText = `Sorry, there was a problem with the server: ${error.response.data.detail || 'Unknown error'}`;
            } else if (error.request) {
                console.error("No response received from backend:", error.request);
                errorMessageText = 'I couldn\'t connect to the AI assistant. Please make sure the backend is running.';
            } else {
                console.error('Error setting up request:', error.message);
            }

            const errorMessage = { role: 'assistant', content: { type: 'answer', text: errorMessageText } };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };
    const handleSpecialMessages = (message) => {
        if (message?.type === '__setSources') {
            setCurrentSources(message.data);
            return;
        }

        handleSendMessage(message); // fall back to regular message sending
    };


    // Handle file upload
    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        if (!conversationStarted) setConversationStarted(true);

        const systemMessage = { role: 'system', content: { text: `Uploading ${file.name}...` } };
        setMessages(prev => [...prev, systemMessage]);
        setIsLoading(true);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(API_UPLOAD_URL, formData);
            const successMessage = { role: 'system', content: { text: `✅ ${response.data.message}` } };
            setMessages(prev => [...prev, successMessage]);
        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = { role: 'system', content: { text: `❌ Error uploading ${file.name}.` } };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const viewVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex bg-gray-50 relative">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col">
                <div className="flex-1 flex flex-col items-center overflow-hidden">
                    <div className="w-full max-w-4xl mx-auto p-4 flex flex-col flex-1 overflow-hidden">
                        <AnimatePresence mode="wait">
                            {!conversationStarted ? (
                                <motion.div
                                    key="initial-view"
                                    variants={viewVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex-1"
                                >
                                    <InitialView
                                        onSendMessage={handleSendMessage}
                                        input={input}
                                        setInput={setInput}
                                        onFileUpload={handleFileUpload}
                                        fileInputRef={fileInputRef}
                                        isLoading={isLoading}
                                    />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="chat-view"
                                    variants={viewVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="flex-1 flex flex-col overflow-hidden"
                                >
                                    <ChatView
                                        messages={messages}
                                        isLoading={isLoading}
                                        onSendMessage={handleSendMessage}
                                        messagesEndRef={messagesEndRef}
                                    />

                                    {/* Chat Input shown inside ChatView block */}
                                    <div className="w-full max-w-3xl mx-auto p-4 pt-2">
                                        <ChatInput
                                            input={input}
                                            setInput={setInput}
                                            onSendMessage={handleSendMessage}
                                            onFileUpload={handleFileUpload}
                                            fileInputRef={fileInputRef}
                                            isLoading={isLoading}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                    </div>
                </div>

            </div>

            {/* Toggle Button & Drawer */}

            {conversationStarted && (
                <div
                    className={`relative h-full transition-transform duration-300 ease-in-out ${
                        isSourceOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
                >
                    {/* Slide-in Source Panel */}
                    <div className="h-full w-[30vw] min-w-[320px] bg-white border-l border-gray-200 shadow-lg z-40 relative">

                        {/* Toggle Button inside the drawer, on the left */}
                        <button
                            onClick={() => setIsSourceOpen(prev => !prev)}
                            className="absolute top-1/2 -left-4 transform -translate-y-1/2 z-50 bg-white border border-gray-300 shadow-md rounded-l-full p-2 hover:bg-gray-100 transition-all duration-200 group flex items-center"
                            title={isSourceOpen ? 'Hide Sources' : 'Show Sources'}
                        >
                            {isSourceOpen ? (
                                <ChevronRight className="h-4 w-4 text-gray-600 group-hover:text-black transition" />
                            ) : (
                                <ChevronLeft className="h-4 w-4 text-gray-600 group-hover:text-black transition" />
                            )}
                        </button>

                        <SourceDisplay sources={currentSources} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;


