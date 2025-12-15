'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { aiApi } from '@/services/api';
import { Bot, Zap, TestTube, Save, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface AIProvider {
  id: string;
  name: string;
  is_enabled: boolean;
  priority: number;
  model: string;
  api_key_configured: boolean;
}

export default function AISettingsPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const response = await aiApi.getProviders();
      setProviders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch providers:', error);
      // Mock data
      setProviders([
        {
          id: '1',
          name: 'Claude',
          is_enabled: true,
          priority: 1,
          model: 'claude-3-5-sonnet-20241022',
          api_key_configured: true,
        },
        {
          id: '2',
          name: 'Gemini',
          is_enabled: true,
          priority: 2,
          model: 'gemini-pro',
          api_key_configured: true,
        },
        {
          id: '3',
          name: 'Groq',
          is_enabled: false,
          priority: 3,
          model: 'mixtral-8x7b-32768',
          api_key_configured: false,
        },
        {
          id: '4',
          name: 'Cohere',
          is_enabled: false,
          priority: 4,
          model: 'command',
          api_key_configured: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProvider = async (providerId: string, enabled: boolean) => {
    try {
      await aiApi.updateProvider(providerId, { is_enabled: enabled });
      setProviders(
        providers.map((p) =>
          p.id === providerId ? { ...p, is_enabled: enabled } : p
        )
      );
      toast.success(`Provider ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update provider');
    }
  };

  const handleTestProvider = async (providerName: string) => {
    setTesting(providerName);
    try {
      const response = await aiApi.testProvider(providerName.toLowerCase());
      setTestResults({
        ...testResults,
        [providerName]: {
          success: response.data.success,
          message: response.data.success ? 'Working correctly!' : 'Connection failed',
        },
      });
      toast.success(`${providerName} is working!`);
    } catch (error) {
      setTestResults({
        ...testResults,
        [providerName]: {
          success: false,
          message: 'Connection failed',
        },
      });
      toast.error(`${providerName} test failed`);
    } finally {
      setTesting(null);
    }
  };

  const getProviderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'claude':
        return '🤖';
      case 'gemini':
        return '✨';
      case 'groq':
        return '⚡';
      case 'cohere':
        return '🧠';
      default:
        return '🔮';
    }
  };

  return (
    <MainLayout title="AI Settings">
      {/* Info Banner */}
      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl p-6 text-white mb-6">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">AI Provider Management</h2>
            <p className="text-purple-100">
              Configure multiple AI providers with automatic fallback. If one fails, the system
              automatically tries the next provider in priority order.
            </p>
          </div>
        </div>
      </div>

      {/* Providers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : (
          providers.map((provider) => (
            <Card key={provider.id}>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{getProviderIcon(provider.name)}</div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{provider.name}</h3>
                      <p className="text-sm text-gray-500">{provider.model}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={provider.is_enabled}
                      onChange={(e) => handleToggleProvider(provider.id, e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-whatsapp-light/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-light"></div>
                  </label>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">Priority:</span>
                    <span className="font-medium text-gray-900">#{provider.priority}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {provider.api_key_configured ? (
                      <span className="flex items-center text-sm text-green-600">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        API Key Set
                      </span>
                    ) : (
                      <span className="flex items-center text-sm text-red-600">
                        <XCircle className="w-4 h-4 mr-1" />
                        No API Key
                      </span>
                    )}
                  </div>
                </div>

                {/* Test Result */}
                {testResults[provider.name] && (
                  <div
                    className={`p-3 rounded-lg mb-4 ${
                      testResults[provider.name].success
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    <div className="flex items-center text-sm">
                      {testResults[provider.name].success ? (
                        <CheckCircle className="w-4 h-4 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                      {testResults[provider.name].message}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTestProvider(provider.name)}
                    isLoading={testing === provider.name}
                    disabled={!provider.api_key_configured}
                  >
                    <TestTube className="w-4 h-4 mr-2" />
                    Test
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Zap className="w-4 h-4 mr-2" />
                    Configure
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* AI Prompts Section */}
      <Card>
        <CardHeader>
          <CardTitle>System Prompts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Welcome Message Prompt (Urdu)
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
                defaultValue="Aap ek professional sales assistant hain jo Shopify store creation service bechte hain. Customer ko warm welcome do aur unki madad karne ke liye ready ho."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sales Conversation Prompt
              </label>
              <textarea
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
                defaultValue="Aap customer se baat kar rahe ho jo Shopify store banana chahta hai. Customer ki requirements samjho, best package suggest karo, aur questions ka professional jawab do."
              />
            </div>
            <div className="flex justify-end">
              <Button>
                <Save className="w-4 h-4 mr-2" />
                Save Prompts
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
