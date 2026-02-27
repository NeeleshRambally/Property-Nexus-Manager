import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, X, Sparkles, Loader2, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useJennaChatbot } from '@/hooks/useJennaChatbot';
import { cn } from '@/lib/utils';

interface JennaChatbotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function JennaChatbot({ isOpen: controlledIsOpen, onOpenChange }: JennaChatbotProps = {}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const setIsOpen = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalIsOpen(open);
    }
  };

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

  // Initialize speech recognition
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser. Try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

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
      {/* Floating Chat Button - Desktop Only */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="hidden md:flex fixed bottom-6 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg items-center justify-center transition-all hover:scale-110 z-50"
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
        <div className="fixed inset-x-0 top-0 md:bottom-6 md:right-6 md:left-auto md:top-auto md:w-96 h-full md:h-[600px] bg-white dark:bg-[#1C1C1E] md:rounded-2xl shadow-2xl flex flex-col z-50 border-t md:border border-black/10 dark:border-white/10">
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
                placeholder={isListening ? "Listening..." : "Ask Jenna anything..."}
                disabled={!isConnected || isSending || isListening}
                className="flex-1 rounded-full"
              />
              <Button
                onClick={toggleSpeechRecognition}
                disabled={!isConnected || isSending}
                size="icon"
                variant={isListening ? "default" : "outline"}
                className={cn(
                  "rounded-full flex-shrink-0",
                  isListening && "bg-red-500 hover:bg-red-600 animate-pulse"
                )}
                title={isListening ? "Stop recording" : "Start voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
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
