'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { ordersApi } from '@/services/api';
import { Order } from '@/types';
import { formatCurrency, formatPhoneNumber, formatDate, timeAgo } from '@/lib/utils';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersApi.getAll({
        page,
        limit: 20,
        status: statusFilter || undefined,
      });
      setOrders(response.data.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Mock data
      setOrders([
        {
          id: '1',
          customer_id: 'c1',
          package_id: 'p2',
          amount: 25000,
          status: 'paid',
          payment_screenshot_url: null,
          store_details: {},
          customer_name: 'Ahmed Khan',
          customer_phone: '923001234567',
          package_name: 'Standard Package',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          paid_at: new Date().toISOString(),
          completed_at: null,
        },
        {
          id: '2',
          customer_id: 'c2',
          package_id: 'p3',
          amount: 45000,
          status: 'in_progress',
          payment_screenshot_url: null,
          store_details: {},
          customer_name: 'Sara Ali',
          customer_phone: '923009876543',
          package_name: 'Premium Package',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          paid_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          completed_at: null,
        },
        {
          id: '3',
          customer_id: 'c3',
          package_id: 'p1',
          amount: 15000,
          status: 'pending',
          payment_screenshot_url: null,
          store_details: {},
          customer_name: 'Usman Malik',
          customer_phone: '923331112222',
          package_name: 'Basic Package',
          created_at: new Date().toISOString(),
          paid_at: null,
          completed_at: null,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      await ordersApi.updateStatus(orderId, newStatus);
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_phone?.includes(searchTerm) ||
      order.package_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    paid: orders.filter((o) => o.status === 'paid').length,
    completed: orders.filter((o) => o.status === 'completed').length,
    revenue: orders
      .filter((o) => ['paid', 'completed', 'in_progress'].includes(o.status))
      .reduce((sum, o) => sum + o.amount, 0),
  };

  return (
    <MainLayout title="Orders">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Orders</p>
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Paid</p>
            <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Completed</p>
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Revenue</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Orders</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-light w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-light"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="payment_pending">Payment Pending</option>
              <option value="paid">Paid</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm text-gray-500">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {order.customer_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatPhoneNumber(order.customer_phone || '')}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{order.package_name}</TableCell>
                    <TableCell className="font-medium text-gray-900">
                      {formatCurrency(order.amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.status)}
                        <Badge status={order.status} />
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {timeAgo(order.created_at)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        {order.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, 'paid')}
                          >
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          </Button>
                        )}
                        {order.status === 'paid' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                        {order.status === 'in_progress' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </MainLayout>
  );
}
