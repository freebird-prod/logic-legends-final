import React, { useState, useEffect } from 'react';
import { Send, Eye, Loader2 } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import emailjs from '@emailjs/browser';
import toast from 'react-hot-toast';
import { db } from '../../../utils/firebaseConfig';
import { EmailTemplate } from '../../types';

export const EmailTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);
    const [sendEmailTemplate, setSendEmailTemplate] = useState<EmailTemplate | null>(null);
    const [sending, setSending] = useState(false);

    const EMAILJS_SERVICE_ID = 'service_m5nq9qc';
    const EMAILJS_TEMPLATE_ID = 'template_gdm7rsq';
    const EMAILJS_PUBLIC_KEY = 'k9brA3kH9BU6FsQZb';

    // Fetch templates on component mount
    useEffect(() => {
        // Initialize EmailJS
        emailjs.init(EMAILJS_PUBLIC_KEY);

        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            setError(null);
            const querySnapshot = await getDocs(collection(db, 'emailTemplates'));
            const templatesData = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as EmailTemplate[];
            setTemplates(templatesData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'welcome': return 'bg-green-100 text-green-800';
            case 'support': return 'bg-blue-100 text-blue-800';
            case 'followup': return 'bg-yellow-100 text-yellow-800';
            case 'escalation': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const sendEmail = async (template: EmailTemplate, recipientEmail: string, variables: Record<string, string>) => {
        try {
            setSending(true);

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(recipientEmail)) {
                throw new Error('Invalid email address');
            }

            // Replace variables in subject and content
            let processedSubject = template.subject;
            let processedContent = template.content;

            Object.entries(variables).forEach(([key, value]) => {
                const placeholder = `{{${key}}}`;
                processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value);
                processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value);
            });

            // Check if all required variables are filled
            const missingVariables = template.variables.filter(variable => !variables[variable] || variables[variable].trim() === '');
            if (missingVariables.length > 0) {
                throw new Error(`Please fill in all required variables: ${missingVariables.join(', ')}`);
            }

            // Send email using EmailJS
            // Note: EmailJS template should be configured with variables: {{subject}}, {{message}}, {{from_name}}
            // For dynamic recipients, configure the recipient in your EmailJS service settings
            const templateParams = {
                subject: processedSubject,
                message: processedContent,
                from_name: 'Support Team'
            };

            console.log('Sending email with params:', templateParams);

            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                templateParams,
                EMAILJS_PUBLIC_KEY
            );

            toast.success('Email sent successfully!');
            return true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to send email';
            console.error('Email sending error:', err); // Debug log
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setSending(false);
        }
    };

    const handleSendEmail = (template: EmailTemplate) => {
        setSendEmailTemplate(template);
    };

    const handleSendEmailSubmit = async (recipientEmail: string, variables: Record<string, string>) => {
        if (!sendEmailTemplate) return;

        const success = await sendEmail(sendEmailTemplate, recipientEmail, variables);
        if (success) {
            setSendEmailTemplate(null);
        }
    };

    const handleCancelSend = () => {
        setSendEmailTemplate(null);
    };

    const refreshTemplates = async () => {
        await fetchTemplates();
        toast.success('Templates refreshed successfully!');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
                    <p className="text-gray-600">Send emails using your saved templates</p>
                </div>
                <button
                    onClick={refreshTemplates}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Refresh Templates
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                    <button
                        onClick={() => setError(null)}
                        className="float-right ml-4 font-bold"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Templates Grid */}
            {loading ? (
                <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Loading templates...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {templates.map((template) => (
                        <div key={template.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                                    <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-2 ${getCategoryColor(template.category)}`}>
                                        {template.category}
                                    </span>
                                </div>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => setPreviewTemplate(template)}
                                        className="p-1 text-gray-400 hover:text-gray-600"
                                        title="Preview"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleSendEmail(template)}
                                        className="p-1 text-blue-400 hover:text-blue-600"
                                        title="Send Email"
                                        disabled={sending}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Subject:</p>
                                    <p className="text-sm text-gray-600 truncate">{template.subject}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-700">Variables:</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                        {template.variables.map((variable) => (
                                            <span key={variable} className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                                {variable}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Send Email Modal */}
            {sendEmailTemplate && (
                <SendEmailModal
                    template={sendEmailTemplate}
                    onSend={handleSendEmailSubmit}
                    onCancel={handleCancelSend}
                    sending={sending}
                />
            )}

            {/* Preview Modal */}
            {previewTemplate && (
                <PreviewModal
                    template={previewTemplate}
                    onClose={() => setPreviewTemplate(null)}
                />
            )}
        </div>
    );
};

// Send Email Modal Component
interface SendEmailModalProps {
    template: EmailTemplate;
    onSend: (recipientEmail: string, variables: Record<string, string>) => void;
    onCancel: () => void;
    sending: boolean;
}

const SendEmailModal: React.FC<SendEmailModalProps> = ({ template, onSend, onCancel, sending }) => {
    const [recipientEmail, setRecipientEmail] = useState('');
    const [variables, setVariables] = useState<Record<string, string>>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSend(recipientEmail, variables);
    };

    const handleVariableChange = (variableName: string, value: string) => {
        setVariables(prev => ({
            ...prev,
            [variableName]: value
        }));
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Send Email: {template.name}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
                        <input
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    {template.variables.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Template Variables</label>
                            <div className="space-y-2">
                                {template.variables.map((variable) => (
                                    <div key={variable}>
                                        <label className="block text-sm text-gray-600 mb-1">
                                            {`{{${variable}}}`}
                                        </label>
                                        <input
                                            type="text"
                                            value={variables[variable] || ''}
                                            onChange={(e) => handleVariableChange(variable, e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder={`Enter value for ${variable}`}
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Preview:</h4>
                        <div className="text-sm text-gray-600">
                            <p><strong>Subject:</strong> {template.subject}</p>
                            <div className="mt-2">
                                <strong>Content:</strong>
                                <div className="mt-1 p-2 bg-white rounded border text-sm whitespace-pre-wrap">
                                    {template.variables.reduce((content, variable) => {
                                        const value = variables[variable] || `{{${variable}}}`;
                                        return content.replace(new RegExp(`{{${variable}}}`, 'g'), value);
                                    }, template.content)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            disabled={sending}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                            disabled={sending || !recipientEmail}
                        >
                            {sending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            {sending ? 'Sending...' : 'Send Email'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Preview Modal Component
interface PreviewModalProps {
    template: EmailTemplate;
    onClose: () => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ template, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Template Preview</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-sm font-medium text-gray-700">Subject:</p>
                        <p className="text-sm text-gray-900 bg-gray-50 p-2 rounded">{template.subject}</p>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-700">Content:</p>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap font-mono">
                            {template.content}
                        </div>
                    </div>

                    <div>
                        <p className="text-sm font-medium text-gray-700">Variables:</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {template.variables.map((variable) => (
                                <span key={variable} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                    {`{{${variable}}}`}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};