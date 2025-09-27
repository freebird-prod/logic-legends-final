import React, { useState } from 'react';
import { Save, Bell, Shield, Database, Bot, Mail, Phone, Trash2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState({
    notifications: {
      emailAlerts: true,
      priorityCallbacks: true,
      systemUpdates: false,
      weeklyReports: true,
    },
    ai: {
      autoClassification: true,
      sentimentAnalysis: true,
      proactiveAlerts: true,
      responseGeneration: false,
      carbonTracking: true,
      wasteAnalysis: true,
    },
    routing: {
      priorityToCall: true,
      normalToChatbot: true,
      autoEscalation: true,
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      dataEncryption: true,
      voiceRecording: true,
    },
  });

  const handleSave = () => {
    // Save settings to backend/localStorage
    localStorage.setItem('appSettings', JSON.stringify(settings));
    alert('Settings saved successfully!');
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value,
      },
    }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">System Settings</h2>
        <p className="text-gray-600">
          Configure your AI support platform preferences and security settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(settings.notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSetting('notifications', key, e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* AI Configuration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Bot className="h-5 w-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">AI Features</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(settings.ai).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSetting('ai', key, e.target.checked)}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Routing Rules */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Phone className="h-5 w-5 text-orange-600" />
            <h3 className="text-lg font-semibold text-gray-900">Auto-Routing</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(settings.routing).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <label className="text-sm text-gray-700 capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim().replace('To', ' → ')}
                </label>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => updateSetting('routing', key, e.target.checked)}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-gray-900">Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Two-Factor Authentication</label>
              <input
                type="checkbox"
                checked={settings.security.twoFactorAuth}
                onChange={(e) => updateSetting('security', 'twoFactorAuth', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Session Timeout (minutes)</label>
              <input
                type="number"
                value={settings.security.sessionTimeout}
                onChange={(e) => updateSetting('security', 'sessionTimeout', parseInt(e.target.value))}
                className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-700">Data Encryption</label>
              <input
                type="checkbox"
                checked={settings.security.dataEncryption}
                onChange={(e) => updateSetting('security', 'dataEncryption', e.target.checked)}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-4">
          <Database className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Advanced Configuration</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Classification Confidence Threshold
            </label>
            <input
              type="range"
              min="0.5"
              max="1"
              step="0.05"
              defaultValue="0.85"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>85%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Auto-Escalation Time (minutes)
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
              <option value="1">1 minute</option>
              <option value="3" selected>3 minutes</option>
              <option value="5">5 minutes</option>
              <option value="10">10 minutes</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Carbon Footprint Tracking
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="enabled" selected>Enabled</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proactive Alert Sensitivity
            </label>
            <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="low">Low</option>
              <option value="medium" selected>Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Management</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors">
            <Database className="h-4 w-4" />
            <span>Export Data</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors">
            <Mail className="h-4 w-4" />
            <span>Backup Settings</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors">
            <Trash2 className="h-4 w-4" />
            <span>Clear Cache</span>
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save className="h-4 w-4" />
          <span>Save Settings</span>
        </button>
      </div>
    </div>
  );
};