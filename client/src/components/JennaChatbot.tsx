import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useJennaChatbot } from '@/hooks/useJennaChatbot';
import { cn } from '@/lib/utils';

export function JennaChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    isConnected,
    isConnecting,
    isSending,
    sendMessage,
  } = useJennaChatbot();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSending]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = () => {
    if (!inputValue.trim() || isSending || !isConnected) {
      return;
    }

    sendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 z-50"
          aria-label="Open Jenna AI Chat"
        >
          <MessageCircle className="w-6 h-6" />
          {isConnected && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white dark:bg-[#1C1C1E] rounded-2xl shadow-2xl flex flex-col z-50 border border-black/10 dark:border-white/10">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-primary/5 to-primary/10 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar className="w-10 h-10 bg-primary">
                  <AvatarFallback className="bg-primary text-white">
                    <Sparkles className="w-5 h-5" />
                  </AvatarFallback>
                </Avatar>
                {isConnected && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-[#1C1C1E]"></span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-sm">Jenna AI</h3>
                <p className="text-xs text-muted-foreground">
                  {isConnecting ? 'Connecting...' : isConnected ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="w-8 h-8 bg-primary flex-shrink-0">
                      <AvatarFallback className="bg-primary text-white">
                        <Sparkles className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm',
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : message.isError
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-900 dark:text-red-200 border border-red-200 dark:border-red-800'
                        : 'bg-muted'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <span
                      className={cn(
                        'text-[10px] mt-1 block opacity-70',
                        message.role === 'user' ? 'text-white' : 'text-muted-foreground'
                      )}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {message.role === 'user' && (
                    <Avatar className="w-8 h-8 bg-muted flex-shrink-0">
                      <AvatarFallback className="bg-muted text-foreground text-xs">
                        You
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isSending && (
                <div className="flex gap-3">
                  <Avatar className="w-8 h-8 bg-primary flex-shrink-0">
                    <AvatarFallback className="bg-primary text-white">
                      <Sparkles className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-2xl px-4 py-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">Jenna is typing...</span>
                  </div>
                </div>
              )}

              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-black/10 dark:border-white/10">
            {!isConnected && (
              <div className="mb-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 rounded-lg">
                Connecting to Jenna AI...
              </div>
            )}
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask Jenna anything..."
                disabled={!isConnected || isSending}
                className="flex-1 rounded-full"
              />
              <Button
                onClick={handleSend}
                disabled={!isConnected || isSending || !inputValue.trim()}
                size="icon"
                className="rounded-full flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 text-center">
              Powered by Jenna AI • RentAssured
            </p>
          </div>
        </div>
      )}
    </>
  );
}
