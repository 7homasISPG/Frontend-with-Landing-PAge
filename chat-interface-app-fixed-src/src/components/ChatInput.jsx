import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Send, Paperclip, Mic } from 'lucide-react';

const ChatInput = ({ input, setInput, onSendMessage, onFileUpload, fileInputRef, isLoading }) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSendMessage(input);
    };

    return (
        <Card className="shadow-lg border border-gray-200">
            <CardContent className="p-3">
                <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-600 hover:text-gray-800 px-3"
                    >
                        <Paperclip className="h-4 w-4 mr-1" />
                        Attach
                    </Button>
                    
                    <div className="flex-1">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask Anything"
                            className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                            disabled={isLoading}
                        />
                    </div>
                    
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-gray-600 hover:text-gray-800 p-2"
                    >
                        <Mic className="h-5 w-5" />
                    </Button>
                    
                    <Button
                        type="submit"
                        size="sm"
                        disabled={isLoading || !input.trim()}
                        className="bg-blue-600 hover:bg-blue-700 text-white p-2"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={onFileUpload}
                    className="hidden"
                />
            </CardContent>
        </Card>
    );
};

export default ChatInput;

