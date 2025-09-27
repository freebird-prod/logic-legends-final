import React, { useState } from 'react';
import { Send, Mic, MicOff, Upload, MessageCircle, Clock, CheckCircle } from 'lucide-react';
import { Ticket } from '../../types';

interface CustomerPortalProps {
  onSubmitTicket: (ticket: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ onSubmitTicket }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [isRecording, setIsRecording] = useState(false);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      // Simulate voice recording completion
      setVoiceNote('voice_recording_' + Date.now() + '.wav');
      setDescription(prev => prev + ' [Voice recording attached]');
    } else {
      // Start recording
      setIsRecording(true);
      // In a real implementation, you would start actual voice recording here
    }
  };

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
      source: voiceNote ? 'call' : 'chat',
      sentiment: classification.sentiment,
      assignedTo: classification.priority === 'priority' ? 'Call Team' :
        classification.priority === 'moderate' ? 'Email Team' : 'AI Chatbot',
      customerInfo: {
        name: 'Customer User', // This would come from auth context
        email: 'customer@email.com',
        phone: '+1-555-0000'
      },
      wasteCategory: classification.wasteCategory,
      voiceRecording: voiceNote || undefined,
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
      setVoiceNote(null);
      setSubmitted(false);
    }, 3000);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto p-6">
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
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="relative bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg overflow-hidden mb-6">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80')" }}
        ></div>
        <div className="relative z-10 p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-2">Submit Support Request</h2>
          <p className="text-lg opacity-90">
            Describe your issue and our AI will automatically route it to the right team.
          </p>
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
            <button
              type="button"
              onClick={handleVoiceRecording}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${isRecording
                  ? 'bg-red-50 border-red-300 text-red-700'
                  : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span>{isRecording ? 'Stop Recording' : 'Add Voice Note'}</span>
            </button>

            {voiceNote && (
              <span className="text-sm text-green-600 flex items-center space-x-1">
                <CheckCircle className="h-4 w-4" />
                <span>Voice note attached</span>
              </span>
            )}
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
  );
};