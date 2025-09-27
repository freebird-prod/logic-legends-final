import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ChatMessage } from '../../types';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI customer support assistant. I can help you with account issues, billing questions, technical problems, and more. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const classifyMessage = (message: string): { priority: string; category: string; sentiment: string } => {
    const text = message.toLowerCase();

    // Priority classification
    let priority = 'normal';
    if (text.includes('urgent') || text.includes('emergency') || text.includes('critical') || text.includes('down') || text.includes('not working')) {
      priority = 'priority';
    } else if (text.includes('issue') || text.includes('problem') || text.includes('error') || text.includes('help')) {
      priority = 'moderate';
    }

    // Category classification
    let category = 'general';
    if (text.includes('billing') || text.includes('payment') || text.includes('charge')) {
      category = 'billing';
    } else if (text.includes('password') || text.includes('login') || text.includes('account')) {
      category = 'account';
    } else if (text.includes('bug') || text.includes('error') || text.includes('not working')) {
      category = 'technical';
    }

    // Sentiment analysis
    let sentiment = 'neutral';
    if (text.includes('frustrated') || text.includes('angry') || text.includes('terrible') || text.includes('worst')) {
      sentiment = 'frustrated';
    } else if (text.includes('thank') || text.includes('great') || text.includes('excellent')) {
      sentiment = 'positive';
    }

    return { priority, category, sentiment };
  };

  const generateResponse = (userMessage: string, classification: { priority: string; category: string; sentiment: string }): string => {
    const { priority, category, sentiment } = classification;

    if (sentiment === 'frustrated') {
      return "I understand your frustration, and I'm here to help resolve this issue as quickly as possible. Let me connect you with a senior support specialist who can provide immediate assistance.";
    }

    if (priority === 'priority') {
      return `I've classified this as a high-priority ${category} issue. I'm immediately escalating this to our specialized team. You should receive a call within the next 5 minutes. In the meantime, here are some immediate steps you can try...`;
    }

    if (category === 'billing') {
      return "I can help you with billing-related questions. For account charges, refunds, or payment method updates, I'll need to verify some information. Let me connect you with our billing specialist who can securely handle your account details.";
    }

    if (category === 'account') {
      return "For account access issues, I recommend first trying our password reset tool. If that doesn't work, I can create a secure ticket for our account recovery team. Would you like me to send you the password reset link?";
    }

    if (category === 'technical') {
      return "I've identified this as a technical issue. Let me gather some information to help diagnose the problem. What device and browser are you using? When did you first notice this issue?";
    }

    return "Thank you for contacting us! I'm analyzing your request to provide the best assistance. Can you provide a bit more detail about what specific help you need today?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Classify the message
    const classification = classifyMessage(inputValue);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: generateResponse(inputValue, classification),
      sender: 'bot',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);

    // If priority, show additional system message
    if (classification.priority === 'priority') {
      setTimeout(() => {
        const systemMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          content: `🚨 Priority ticket #${Math.floor(Math.random() * 9000) + 1000} has been created and assigned to our call center team. Estimated callback time: 3-5 minutes.`,
          sender: 'bot',
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, systemMessage]);
      }, 2000);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-96">
      <div className="relative p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80')" }}
        ></div>
        <div className="relative z-10 flex items-center space-x-3">
          <Bot className="h-8 w-8 text-blue-600" />
          <div>
            <h3 className="font-semibold text-gray-900">AI Support Assistant</h3>
            <p className="text-sm text-gray-600">Powered by Agentic AI • Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-2 max-w-xs lg:max-w-md`}>
              {message.sender === 'bot' && (
                <Bot className="h-6 w-6 text-blue-600 mt-1" />
              )}
              <div
                className={`px-4 py-2 rounded-lg ${message.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                  }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
              {message.sender === 'user' && (
                <User className="h-6 w-6 text-gray-400 mt-1" />
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start space-x-2">
            <Bot className="h-6 w-6 text-blue-600 mt-1" />
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={isTyping}
          />
          <button
            onClick={handleSendMessage}
            disabled={isTyping || !inputValue.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500">
            AI will classify and route your message automatically
          </p>
          <div className="flex space-x-1">
            <button className="p-1 text-gray-400 hover:text-green-600">
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button className="p-1 text-gray-400 hover:text-red-600">
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};