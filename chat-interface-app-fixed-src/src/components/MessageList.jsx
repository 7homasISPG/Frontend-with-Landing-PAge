import React from 'react';
import { motion } from 'framer-motion';
import Message from './Message';
import LoadingIndicator from './LoadingIndicator';

const MessageList = ({ messages, isLoading, onSendMessage, messagesEndRef }) => {
    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, index) => (
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Message message={msg} onSendMessage={onSendMessage} />
                </motion.div>
            ))}
            
            {isLoading && <LoadingIndicator />}
            
            <div ref={messagesEndRef} />
        </div>
    );
};

export default MessageList;

