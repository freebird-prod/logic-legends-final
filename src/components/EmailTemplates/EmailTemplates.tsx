import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';

interface EmailTemplate {
    id: string;
    name: string;
    subject: string;
    content: string;
    category: 'welcome' | 'support' | 'followup' | 'escalation';
    variables: string[];
}

export const EmailTemplates: React.FC = () => {
    const [templates, setTemplates] = useState<EmailTemplate[]>([
        {
            id: '1',
            name: 'Welcome Email',
            subject: 'Welcome to Our Support System',
            content: 'Dear {{customer_name}},\n\nWelcome to our customer support system. We\'re here to help you with any questions or issues you may have.\n\nBest regards,\nSupport Team',
            category: 'welcome',
            variables: ['customer_name']
        },
        {
            id: '2',
            name: 'Support Response',
            subject: 'Re: {{ticket_title}}',
            content: 'Dear {{customer_name}},\n\nThank you for contacting our support team. We have received your ticket and are working on resolving your issue.\n\nTicket ID: {{ticket_id}}\nPriority: {{priority}}\n\nWe will get back to you within {{response_time}}.\n\nBest regards,\n{{agent_name}}\nSupport Team',
            category: 'support',
            variables: ['customer_name', 'ticket_title', 'ticket_id', 'priority', 'response_time', 'agent_name']
        },
        {
            id: '3',
            name: 'Follow-up Email',
            subject: 'Follow-up on Your Support Ticket',
            content: 'Dear {{customer_name}},\n\nWe wanted to follow up on your recent support ticket (ID: {{ticket_id}}). Has your issue been resolved?\n\nIf you need further assistance, please don\'t hesitate to reply to this email.\n\nBest regards,\nSupport Team',
            category: 'followup',
            variables: ['customer_name', 'ticket_id']
        }
    ]);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
    const [previewTemplate, setPreviewTemplate] = useState<EmailTemplate | null>(null);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'welcome': return 'bg-green-100 text-green-800';
            case 'support': return 'bg-blue-100 text-blue-800';
            case 'followup': return 'bg-yellow-100 text-yellow-800';
            case 'escalation': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const handleDelete = (id: string) => {
        setTemplates(templates.filter(t => t.id !== id));
    };

    const handleEdit = (template: EmailTemplate) => {
        setEditingTemplate(template);
        setShowCreateForm(true);
    };

    const handleCreate = () => {
        setEditingTemplate(null);
        setShowCreateForm(true);
    };

    const handleSave = (template: EmailTemplate) => {
        if (editingTemplate) {
            setTemplates(templates.map(t => t.id === editingTemplate.id ? template : t));
        } else {
            setTemplates([...templates, { ...template, id: Date.now().toString() }]);
        }
        setShowCreateForm(false);
        setEditingTemplate(null);
    };

    const handleCancel = () => {
        setShowCreateForm(false);
        setEditingTemplate(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Email Templates</h2>
                    <p className="text-gray-600">Manage email templates for different types of customer communications</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Template</span>
                </button>
            </div>

            {/* Templates Grid */}
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
                                    onClick={() => handleEdit(template)}
                                    className="p-1 text-gray-400 hover:text-gray-600"
                                    title="Edit"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => handleDelete(template.id)}
                                    className="p-1 text-gray-400 hover:text-red-600"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
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

            {/* Create/Edit Form Modal */}
            {showCreateForm && (
                <TemplateForm
                    template={editingTemplate}
                    onSave={handleSave}
                    onCancel={handleCancel}
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

// Template Form Component
interface TemplateFormProps {
    template: EmailTemplate | null;
    onSave: (template: EmailTemplate) => void;
    onCancel: () => void;
}

const TemplateForm: React.FC<TemplateFormProps> = ({ template, onSave, onCancel }) => {
    const [formData, setFormData] = useState<EmailTemplate>(
        template || {
            id: '',
            name: '',
            subject: '',
            content: '',
            category: 'support',
            variables: []
        }
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    const extractVariables = (content: string) => {
        const matches = content.match(/\{\{(\w+)\}\}/g);
        return matches ? [...new Set(matches.map(m => m.slice(2, -2)))] : [];
    };

    const handleContentChange = (content: string) => {
        setFormData({
            ...formData,
            content,
            variables: extractVariables(content)
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {template ? 'Edit Template' : 'Create New Template'}
                </h3>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as EmailTemplate['category'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="welcome">Welcome</option>
                            <option value="support">Support</option>
                            <option value="followup">Follow-up</option>
                            <option value="escalation">Escalation</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subject Line</label>
                        <input
                            type="text"
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Content</label>
                        <textarea
                            value={formData.content}
                            onChange={(e) => handleContentChange(e.target.value)}
                            rows={10}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                            placeholder="Use {{variable_name}} for dynamic content"
                            required
                        />
                    </div>

                    {formData.variables.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Detected Variables</label>
                            <div className="flex flex-wrap gap-2">
                                {formData.variables.map((variable) => (
                                    <span key={variable} className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                        {`{{${variable}}}`}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {template ? 'Update Template' : 'Create Template'}
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