'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { whatsappApi } from '@/services/api';
import { WhatsAppAccount } from '@/types';
import socketService from '@/services/socket';
import { Smartphone, Plus, QrCode, RefreshCw, Power, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function WhatsAppPage() {
  const [accounts, setAccounts] = useState<WhatsAppAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [qrCode, setQrCode] = useState<{ accountId: string; qr: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');

  useEffect(() => {
    fetchAccounts();

    // Listen for WhatsApp events
    socketService.on('whatsapp_qr', handleQRCode);
    socketService.on('whatsapp_ready', handleReady);
    socketService.on('whatsapp_disconnected', handleDisconnected);

    return () => {
      socketService.off('whatsapp_qr', handleQRCode);
      socketService.off('whatsapp_ready', handleReady);
      socketService.off('whatsapp_disconnected', handleDisconnected);
    };
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await whatsappApi.getAccounts();
      setAccounts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      // Mock data
      setAccounts([
        {
          id: 'wa1',
          phone_number: '923001234567',
          name: 'Main Business Account',
          status: 'ready',
          messages_sent_today: 145,
          risk_level: 'low',
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
        {
          id: 'wa2',
          phone_number: null,
          name: 'Backup Account',
          status: 'disconnected',
          messages_sent_today: 0,
          risk_level: 'low',
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQRCode = (data: { accountId: string; qrCode: string }) => {
    setQrCode({ accountId: data.accountId, qr: data.qrCode });
    toast.success('QR Code received! Please scan with WhatsApp.');
  };

  const handleReady = (data: { accountId: string; phoneNumber: string }) => {
    setQrCode(null);
    toast.success(`WhatsApp connected: ${data.phoneNumber}`);
    fetchAccounts();
  };

  const handleDisconnected = (data: { accountId: string }) => {
    toast.error('WhatsApp disconnected');
    fetchAccounts();
  };

  const handleCreateAccount = async () => {
    if (!newAccountName.trim()) return;

    try {
      await whatsappApi.createAccount(newAccountName);
      toast.success('Account created! Getting QR code...');
      setNewAccountName('');
      setShowAddModal(false);
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to create account');
    }
  };

  const handleGetQR = async (accountId: string) => {
    try {
      const response = await whatsappApi.getQRCode(accountId);
      setQrCode({ accountId, qr: response.data.data.qrCode });
    } catch (error) {
      toast.error('Failed to get QR code');
    }
  };

  const handleDisconnect = async (accountId: string) => {
    try {
      await whatsappApi.disconnect(accountId);
      toast.success('Account disconnected');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to disconnect account');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-500';
      case 'connected':
        return 'bg-green-500';
      case 'qr_received':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <MainLayout title="WhatsApp Accounts">
      {/* Header Actions */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-gray-600">
            Manage your WhatsApp accounts and connections
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Account
        </Button>
      </div>

      {/* QR Code Modal */}
      {qrCode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Scan QR Code</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="bg-white p-4 rounded-lg inline-block mb-4">
                <img src={qrCode.qr} alt="WhatsApp QR Code" className="w-64 h-64" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Open WhatsApp on your phone, go to Settings &gt; Linked Devices &gt; Link a Device
              </p>
              <Button variant="outline" onClick={() => setQrCode(null)}>
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Add WhatsApp Account</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Main Business Account"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateAccount}>Create</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <div className="spinner"></div>
          </div>
        ) : accounts.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-12 text-center">
                <Smartphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No WhatsApp accounts yet</p>
                <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Account
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          accounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        account.status === 'ready'
                          ? 'bg-whatsapp-light/20'
                          : 'bg-gray-100'
                      }`}
                    >
                      <Smartphone
                        className={`w-6 h-6 ${
                          account.status === 'ready'
                            ? 'text-whatsapp-dark'
                            : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{account.name}</h3>
                      <p className="text-sm text-gray-500">
                        {account.phone_number || 'Not connected'}
                      </p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(account.status)}`}></div>
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <Badge status={account.status} />
                  <Badge status={account.risk_level} />
                </div>

                {/* Stats */}
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Messages Today</span>
                    <span className="font-medium text-gray-900">
                      {account.messages_sent_today}
                    </span>
                  </div>
                </div>

                {/* Risk Warning */}
                {account.risk_level === 'high' && (
                  <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg mb-4 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    High risk of ban! Reduce message volume.
                  </div>
                )}

                {/* Actions */}
                <div className="flex space-x-2">
                  {account.status === 'disconnected' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleGetQR(account.id)}
                    >
                      <QrCode className="w-4 h-4 mr-2" />
                      Connect
                    </Button>
                  )}
                  {account.status === 'ready' && (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleDisconnect(account.id)}
                      >
                        <Power className="w-4 h-4 mr-2" />
                        Disconnect
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </MainLayout>
  );
}
