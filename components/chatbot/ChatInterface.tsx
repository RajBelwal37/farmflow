'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, X, Send, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export function ChatInterface() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Load messages from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: 'Error',
          description: 'Failed to load chat history',
          variant: 'destructive',
        });
      }
    }
  }, [toast]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    try {
      setIsLoading(true);
      
      // Add user message
      const userMessage: Message = {
        role: 'user',
        content: input.trim(),
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInput('');

      // Get response
      const response = await getResponse(input.trim());
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
        timestamp: Date.now(),
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: 'Error',
        description: 'Failed to process your message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getResponse = async (message: string): Promise<string> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerMessage = message.toLowerCase();
    
    // Farm management related responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
      return 'Hello! I\'m your farm management assistant. How can I help you today?';
    }
    if (lowerMessage.includes('crop')) {
      return 'I can help you with crop management. You can track planting dates, growth stages, and harvest schedules. What specific information do you need?';
    }
    if (lowerMessage.includes('livestock')) {
      return 'I can assist you with livestock management. You can track animal health, feeding schedules, and breeding records. What would you like to know?';
    }
    if (lowerMessage.includes('weather')) {
      return 'I can help you with weather information. You can check current conditions, forecasts, and historical data. What specific weather details do you need?';
    }
    if (lowerMessage.includes('inventory')) {
      return 'I can help you manage your inventory. You can track supplies, equipment, and resources. What would you like to know about your inventory?';
    }
    if (lowerMessage.includes('help')) {
      return 'I can help you with:\n- Crop management\n- Livestock tracking\n- Weather monitoring\n- Inventory management\n- General farm operations\nWhat would you like to know more about?';
    }
    
    return "I'm here to help with farm management. You can ask me about crops, livestock, weather, or inventory. Type 'help' for more information.";
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem('chatMessages');
    toast({
      title: 'Chat cleared',
      description: 'Your chat history has been cleared.',
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="flex flex-col h-[500px] w-[350px] bg-card text-card-foreground rounded-lg shadow-xl border border-border">
          <div className="flex justify-between items-center p-4 border-b">
            <h3 className="font-semibold">Farm Assistant</h3>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <ScrollArea ref={scrollRef} className="flex-1 p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted text-muted-foreground rounded-bl-none'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="inline-block p-3 rounded-lg bg-muted text-muted-foreground rounded-bl-none">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
          </ScrollArea>
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                className="flex-1"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSend} 
                size="icon"
                disabled={isLoading || !input.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full p-6 shadow-lg bg-primary hover:bg-primary/90"
          size="icon"
        >
          <Mail size={32} color="white" />
        </Button>
      )}
    </div>
  );
} 