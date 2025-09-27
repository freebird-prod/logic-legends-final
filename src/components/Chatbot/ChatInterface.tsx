import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, ThumbsUp, ThumbsDown, MessageSquare, Plus } from 'lucide-react';
import { TicketService } from '../../services/ticketService';
import { openRouterService } from '../../services/openRouterService';
import { ChatMessage, ChatSession } from '../../types';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hello! I'm your AI customer support assistant. I can help you with account issues, billing questions, technical problems, and more. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatHistoryUnsubscribeRef = useRef<(() => void) | null>(null);
  const currentChatUnsubscribeRef = useRef<(() => void) | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = () => {
    // Clean up previous listener
    if (chatHistoryUnsubscribeRef.current) {
      chatHistoryUnsubscribeRef.current();
    }

    // Set up real-time listener for chat history
    chatHistoryUnsubscribeRef.current = TicketService.listenToChatSessions((chatSessions) => {
      setChatHistory(chatSessions);
    }, 10);
  };

  const startNewChat = () => {
    // Clean up current chat listener
    if (currentChatUnsubscribeRef.current) {
      currentChatUnsubscribeRef.current();
      currentChatUnsubscribeRef.current = null;
    }

    setMessages([
      {
        id: '1',
        content: "Hello! I'm your AI customer support assistant. I can help you with account issues, billing questions, technical problems, and more. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date().toISOString(),
      }
    ]);
    setCurrentChatId(null);
    setShowHistory(false);
  };

  const loadChat = (chatId: string) => {
    // Clean up previous listener
    if (currentChatUnsubscribeRef.current) {
      currentChatUnsubscribeRef.current();
    }

    // Set up real-time listener for current chat session
    currentChatUnsubscribeRef.current = TicketService.listenToChatSession(chatId, (chatSession) => {
      if (chatSession) {
        setMessages(chatSession.messages);
        setCurrentChatId(chatId);
        setShowHistory(false);
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChatHistory();

    // Cleanup listeners on unmount
    return () => {
      if (chatHistoryUnsubscribeRef.current) {
        chatHistoryUnsubscribeRef.current();
      }
      if (currentChatUnsubscribeRef.current) {
        currentChatUnsubscribeRef.current();
      }
    };
  }, []);

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

    try {
      // Prepare conversation history for OpenRouter
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      const response = await openRouterService.generateResponse(userMessage.content, [...conversationHistory, { role: 'user', content: userMessage.content }]);

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      let newMessages = [...messages, userMessage, botResponse];
      setMessages(prev => [...prev, botResponse]);

      // Save chat session
      if (currentChatId) {
        await TicketService.updateChatSession(currentChatId, { messages: newMessages });
      } else {
        const title = userMessage.content.length > 50 ? userMessage.content.substring(0, 50) + '...' : userMessage.content;
        const chatId = await TicketService.saveChatSession({
          messages: newMessages,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          title
        });
        setCurrentChatId(chatId);
      }

      // If priority, show additional system message
      if (response.classification.priority === 'priority') {
        setTimeout(async () => {
          const systemMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            content: `🚨 Priority ticket #${Math.floor(Math.random() * 9000) + 1000} has been created and assigned to our call center team. Estimated callback time: 3-5 minutes.`,
            sender: 'bot',
            timestamp: new Date().toISOString(),
          };
          setMessages(prev => {
            const finalMessages = [...prev, systemMessage];
            // Update session with the system message
            if (currentChatId) {
              TicketService.updateChatSession(currentChatId, { messages: finalMessages });
            } else if (newMessages.length > 0) {
              // This case handles if currentChatId was null but has just been set by TicketService.saveChatSession
              TicketService.updateChatSession(currentChatId || '', { messages: finalMessages });
            }
            return finalMessages;
          });
        }, 2000);
      }
    } catch (error) {
      console.error('Error generating response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-96 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Chat History Sidebar */}
      <div className={`w-64 border-r border-gray-200 ${showHistory ? 'block' : 'hidden'} md:block`}>
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Chat History</h3>
            <button
              onClick={startNewChat}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="New Chat"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto h-full pb-4">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              onClick={() => loadChat(chat.id)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${currentChatId === chat.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
            >
              <p className="text-sm font-medium text-gray-900 truncate">
                {chat.title || 'New Chat'}
              </p>
              <p className="text-xs text-gray-500">
                {new Date(chat.updatedAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 flex flex-col">
        <div className="relative p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-10"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80')" }}
          ></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bot className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold text-gray-900">AI Support Assistant</h3>
                <p className="text-sm text-gray-600">Powered by Agentic AI • Online</p>
              </div>
            </div>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-800"
              title="Toggle History"
            >
              <MessageSquare className="h-5 w-5" />
            </button>
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
              <button className="p-1 text-gray-400 hover:text-green-600" title="Good response">
                <ThumbsUp className="h-4 w-4" />
              </button>
              <button className="p-1 text-gray-400 hover:text-red-600" title="Bad response">
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};