'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Save, CreditCard, Bell, Shield, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    toast.success('Settings saved successfully');
  };

  return (
    <MainLayout title="Settings">
      <div className="max-w-4xl space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-gray-500" />
              <CardTitle>General Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Business Name"
              defaultValue="Shopify Store Service"
              placeholder="Your business name"
            />
            <Input
              label="Contact Email"
              type="email"
              defaultValue="contact@example.com"
              placeholder="Your contact email"
            />
            <Input
              label="WhatsApp Business Number"
              defaultValue="+92 300 1234567"
              placeholder="+92 xxx xxxxxxx"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Language
              </label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-light">
                <option value="urdu">Roman Urdu</option>
                <option value="english">English</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <CardTitle>Payment Methods</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">EasyPaisa</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-light"></div>
                </label>
              </div>
              <Input
                label="Account Number"
                defaultValue="03001234567"
                placeholder="Enter EasyPaisa number"
              />
              <Input
                label="Account Title"
                defaultValue="Ahmed Khan"
                placeholder="Account holder name"
              />
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">JazzCash</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-light"></div>
                </label>
              </div>
              <Input
                label="Account Number"
                defaultValue="03009876543"
                placeholder="Enter JazzCash number"
              />
              <Input
                label="Account Title"
                defaultValue="Ahmed Khan"
                placeholder="Account holder name"
              />
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Bank Transfer</h4>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-light"></div>
                </label>
              </div>
              <Input
                label="Bank Name"
                defaultValue="HBL"
                placeholder="Enter bank name"
              />
              <Input
                label="Account Number"
                defaultValue="1234567890123456"
                placeholder="Enter account number"
              />
              <Input
                label="Account Title"
                defaultValue="Ahmed Khan"
                placeholder="Account holder name"
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-500" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">New Order Notifications</p>
                <p className="text-sm text-gray-500">Get notified when a new order is placed</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-light"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Payment Notifications</p>
                <p className="text-sm text-gray-500">Get notified when payment is received</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-light"></div>
              </label>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">WhatsApp Disconnect Alert</p>
                <p className="text-sm text-gray-500">Get notified when WhatsApp disconnects</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-whatsapp-light"></div>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <CardTitle>Rate Limiting (Anti-Ban)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Max Messages Per Minute"
              type="number"
              defaultValue="20"
              placeholder="20"
            />
            <Input
              label="Max Messages Per Hour"
              type="number"
              defaultValue="200"
              placeholder="200"
            />
            <Input
              label="Message Delay (min ms)"
              type="number"
              defaultValue="1000"
              placeholder="1000"
            />
            <Input
              label="Message Delay (max ms)"
              type="number"
              defaultValue="3000"
              placeholder="3000"
            />
            <p className="text-sm text-gray-500">
              These settings help prevent your WhatsApp account from being banned by limiting
              message frequency and adding random delays.
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} isLoading={saving}>
            <Save className="w-4 h-4 mr-2" />
            Save All Settings
          </Button>
        </div>
      </div>
    </MainLayout>
  );
}
