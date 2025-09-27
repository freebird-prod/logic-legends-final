import React, { useState, useRef, useEffect } from 'react';
import { Send, CheckCircle, Bot, User, ThumbsUp, ThumbsDown, Sparkles, FileText, Zap } from 'lucide-react';
import { Ticket, ChatMessage } from '../../types';
import { openRouterService, ChatClassification, OpenRouterMessage } from '../../services/openRouterService';

interface CustomerPortalProps {
  onSubmitTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onSubmitTicket }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Chatbot state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI customer support assistant powered by advanced language models. I can help you with account issues, billing questions, technical problems, and more. You can either chat with me here or submit a formal ticket using the form. How can I assist you today?',
      sender: 'bot',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatHeight, setChatHeight] = useState('400px');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [conversationHistory, setConversationHistory] = useState<OpenRouterMessage[]>([]);
  const [currentClassification, setCurrentClassification] = useState<ChatClassification | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const suggestionQuestions = [
    "I can't access my account",
    "How do I reset my password?",
    "I have a billing question",
    "Product quality issue",
    "Shipping problem",
    "Technical support needed"
  ];

  const classifyTicket = (title: string, description: string, category: string) => {
    const text = (title + ' ' + description).toLowerCase();

    // Priority classification
    let priority: 'normal' | 'moderate' | 'priority' = 'normal';
    if (text.includes('urgent') || text.includes('emergency') || text.includes('critical') ||
      text.includes('down') || text.includes('not working') || text.includes('broken')) {
      priority = 'priority';
    } else if (text.includes('issue') || text.includes('problem') || text.includes('error') ||
      text.includes('help') || text.includes('billing') || text.includes('payment')) {
      priority = 'moderate';
    }

    // Sentiment analysis
    let sentiment: 'positive' | 'neutral' | 'frustrated' | 'angry' = 'neutral';
    if (text.includes('frustrated') || text.includes('angry') || text.includes('terrible') ||
      text.includes('worst') || text.includes('horrible')) {
      sentiment = 'frustrated';
    } else if (text.includes('furious') || text.includes('outraged') || text.includes('disgusted')) {
      sentiment = 'angry';
    } else if (text.includes('thank') || text.includes('great') || text.includes('excellent')) {
      sentiment = 'positive';
    }

    // Waste category classification
    let wasteCategory: 'product_defect' | 'shipping_error' | 'user_confusion' | 'process_issue' | null = null;
    if (text.includes('defect') || text.includes('broken') || text.includes('damaged') || text.includes('quality')) {
      wasteCategory = 'product_defect';
    } else if (text.includes('shipping') || text.includes('delivery') || text.includes('package')) {
      wasteCategory = 'shipping_error';
    } else if (text.includes('confused') || text.includes('how to') || text.includes('don\'t understand')) {
      wasteCategory = 'user_confusion';
    } else if (text.includes('process') || text.includes('procedure') || text.includes('workflow')) {
      wasteCategory = 'process_issue';
    }

    return { priority, sentiment, wasteCategory };
  };

  const classifyMessage = (message: string): { priority: string; category: string; sentiment: string } => {
    const text = message.toLowerCase();

    let priority = 'normal';
    if (text.includes('urgent') || text.includes('emergency') || text.includes('critical') || text.includes('down') || text.includes('not working')) {
      priority = 'priority';
    } else if (text.includes('issue') || text.includes('problem') || text.includes('error') || text.includes('help')) {
      priority = 'moderate';
    }

    let category = 'general';
    if (text.includes('billing') || text.includes('payment') || text.includes('charge')) {
      category = 'billing';
    } else if (text.includes('password') || text.includes('login') || text.includes('account')) {
      category = 'account';
    } else if (text.includes('bug') || text.includes('error') || text.includes('not working')) {
      category = 'technical';
    } else if (text.includes('shipping') || text.includes('delivery') || text.includes('package')) {
      category = 'shipping';
    }

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
      return "I understand your frustration, and I'm here to help resolve this issue as quickly as possible. Let me connect you with a senior support specialist who can provide immediate assistance. Would you like me to create a priority ticket for you?";
    }

    if (priority === 'priority') {
      return `I've classified this as a high-priority ${category} issue. I'm immediately escalating this to our specialized team. You should receive a call within the next 5 minutes. Would you also like me to pre-fill a support ticket with this information?`;
    }

    if (category === 'billing') {
      return "I can help you with billing-related questions. For account charges, refunds, or payment method updates, I'll need to verify some information. Let me connect you with our billing specialist who can securely handle your account details. Would you like me to create a billing support ticket?";
    }

    if (category === 'account') {
      return "For account access issues, I recommend first trying our password reset tool. If that doesn't work, I can create a secure ticket for our account recovery team. Would you like me to: 1) Send you the password reset link, or 2) Create an account recovery ticket?";
    }

    if (category === 'technical') {
      return "I've identified this as a technical issue. Let me gather some information to help diagnose the problem. What device and browser are you using? When did you first notice this issue? I can also pre-fill a technical support ticket if needed.";
    }

    if (category === 'shipping') {
      return "I can help with shipping and delivery issues. Please provide your order number if you have it. I can track your package status and create a shipping inquiry ticket if needed. What specific shipping issue are you experiencing?";
    }

    return "Thank you for contacting us! I'm analyzing your request to provide the best assistance. Can you provide a bit more detail about what specific help you need today? I can also help you submit a formal support ticket if needed.";
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
    const currentInput = inputValue;
    setInputValue('');
    setIsTyping(true);
    setShowSuggestions(false);

    // Update conversation history for OpenRouter
    const newConversationHistory: OpenRouterMessage[] = [
      ...conversationHistory,
      { role: 'user', content: currentInput }
    ];

    try {
      // Get AI response from OpenRouter
      const response = await openRouterService.generateResponse(currentInput, conversationHistory);

      const botResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response.message,
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botResponse]);
      setCurrentClassification(response.classification);

      // Update conversation history
      setConversationHistory([
        ...newConversationHistory,
        { role: 'assistant', content: response.message }
      ]);

      // Handle priority escalation
      if (response.classification.priority === 'priority' || response.classification.needsHuman) {
        setTimeout(() => {
          const systemMessage: ChatMessage = {
            id: (Date.now() + 2).toString(),
            content: `🚨 ${response.classification.priority === 'priority' ? 'Priority' : 'Escalated'} ticket #${Math.floor(Math.random() * 9000) + 1000} has been created and assigned to our ${response.classification.priority === 'priority' ? 'call center' : 'specialist'} team. Estimated response time: ${response.classification.priority === 'priority' ? '3-5 minutes' : '15-30 minutes'}.`,
            sender: 'bot',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, systemMessage]);
        }, 2000);
      }

      // Show suggested actions if available
      if (response.classification.suggestedActions.length > 0) {
        setTimeout(() => {
          const actionsMessage: ChatMessage = {
            id: (Date.now() + 3).toString(),
            content: `💡 Suggested actions:\n• ${response.classification.suggestedActions.join('\n• ')}`,
            sender: 'bot',
            timestamp: new Date().toISOString()
          };
          setMessages(prev => [...prev, actionsMessage]);
        }, 3000);
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      // Show error message to user
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm experiencing technical difficulties right now. Please try again in a moment, or submit a support ticket using the form below.",
        sender: 'bot',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setShowSuggestions(false);
  };

  const createTicketFromChat = async () => {
    if (conversationHistory.length === 0) {
      const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
      if (lastUserMessage) {
        setTitle('Chat Support Request');
        setDescription(lastUserMessage.content);
      }
      return;
    }

    try {
      // Generate AI-powered ticket summary
      const ticketSummary = await openRouterService.generateTicketSummary(conversationHistory);
      setTitle(ticketSummary.title);
      setDescription(ticketSummary.description);
      setCategory(ticketSummary.category);
    } catch (error) {
      console.error('Error generating ticket summary:', error);
      // Fallback to simple approach
      const lastUserMessage = messages.filter(m => m.sender === 'user').pop();
      if (lastUserMessage) {
        setTitle('Support Request from Chat');
        setDescription(lastUserMessage.content);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);

    const classification = classifyTicket(title, description, category);

    const newTicket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'> = {
      title,
      description,
      priority: classification.priority,
      category,
      status: 'open',
      source: 'chat',
      sentiment: classification.sentiment,
      assignedTo: classification.priority === 'priority' ? 'Call Team' :
        classification.priority === 'moderate' ? 'Email Team' : 'AI Chatbot',
      customerInfo: {
        name: 'Customer User', // This would come from auth context
        email: 'customer@email.com',
        phone: '+1-555-0000'
      },
      wasteCategory: classification.wasteCategory,
      carbonFootprint: Math.random() * 0.5, // Simulated carbon footprint
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    onSubmitTicket(newTicket);
    setIsSubmitting(false);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setTitle('');
      setDescription('');
      setCategory('general');
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-green-900 mb-2">Ticket Submitted Successfully!</h2>
            <p className="text-green-700 mb-4">
              Your support request has been received and automatically classified.
              Our team will respond shortly.
            </p>
            <div className="bg-white rounded-lg p-4 text-left">
              <h3 className="font-medium text-gray-900 mb-2">What happens next:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Priority tickets → Immediate call from our team (3-5 minutes)</li>
                <li>• Moderate tickets → Email response within 1 hour</li>
                <li>• Normal tickets → AI chatbot assistance or email within 4 hours</li>
              </ul>
            </div>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Support Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chatbot Section */}
        <div className="space-y-6">
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1632&q=80')" }}
            ></div>
            <div className="relative z-10 p-6 text-white">
              <div className="flex items-center space-x-3">
                <Bot className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">AI Chat Assistant</h2>
                  <p className="text-lg opacity-90">
                    Get instant help with your questions
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col" style={{ height: chatHeight }}>
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bot className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">AI Support Assistant</h3>
                    <p className="text-xs font-semibold text-gray-600 flex items-center space-x-2">
                      <span>Powered by OpenRouter AI</span>
                      <span className="text-green-500">• Online</span>
                      {currentClassification && (
                        <span className={`text-xs px-2 py-1 rounded-full ${currentClassification.priority === 'priority' ? 'bg-red-100 text-red-800' :
                          currentClassification.priority === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                          {currentClassification.priority.toUpperCase()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setChatHeight(chatHeight === '400px' ? '600px' : '400px')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {chatHeight === '400px' ? 'Expand' : 'Collapse'}
                  </button>
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
                      <Bot className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    )}
                    <div
                      className={`px-4 py-2 rounded-lg ${message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                        }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {message.sender === 'user' && (
                      <User className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
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

            {/* Suggestions */}
            {showSuggestions && messages.length === 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestionQuestions.slice(0, 3).map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-200 space-y-3">
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

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <p className="text-xs text-gray-500 flex items-center space-x-2">
                    <Zap className="h-3 w-3 text-blue-500" />
                    <span>AI-powered smart routing</span>
                    {currentClassification && (
                      <span className="text-blue-600">
                        • Category: {currentClassification.category}
                      </span>
                    )}
                  </p>
                  <button
                    onClick={createTicketFromChat}
                    className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1 transition-colors"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Create Ticket</span>
                  </button>
                </div>
                <div className="flex space-x-1">
                  <button className="p-1 text-gray-400 hover:text-green-600 transition-colors">
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-red-600 transition-colors">
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Ticket Form Section */}
        <div className="space-y-6">
          <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg overflow-hidden">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
            ></div>
            <div className="relative z-10 p-6 text-white">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8" />
                <div>
                  <h2 className="text-2xl font-bold">Submit Support Request</h2>
                  <p className="text-lg opacity-90">
                    Create a formal ticket for complex issues
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="general">General Support</option>
                  <option value="technical">Technical Issue</option>
                  <option value="billing">Billing & Payments</option>
                  <option value="account">Account Management</option>
                  <option value="product_quality">Product Quality</option>
                  <option value="shipping">Shipping & Delivery</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Please provide as much detail as possible about your issue..."
                  required
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Sparkles className="h-4 w-4 text-blue-500" />
                  <span>AI-powered smart routing enabled</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">AI-Powered Smart Routing</h3>
                <p className="text-sm text-blue-700">
                  Our AI will automatically analyze your request and route it to the most appropriate team:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>🔴 <strong>Priority:</strong> Immediate call from our specialists</li>
                  <li>🟡 <strong>Moderate:</strong> Email team response within 1 hour</li>
                  <li>🟢 <strong>Normal:</strong> AI chatbot or standard email support</li>
                </ul>
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <p className="text-xs text-blue-600">
                    💡 Tip: Try our AI chat assistant first for instant help, then create a ticket if needed.
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim() || !description.trim()}
                className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Submitting & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Submit Support Request</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};