'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { customersApi } from '@/services/api';
import { Customer } from '@/types';
import { formatCurrency, formatPhoneNumber, formatDate, timeAgo } from '@/lib/utils';
import { Search, Filter, UserPlus, MoreVertical, Eye, Ban, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customersApi.getAll({ page, limit: 20 });
      setCustomers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      // Mock data
      setCustomers([
        {
          id: '1',
          phone_number: '923001234567',
          name: 'Ahmed Khan',
          email: 'ahmed@example.com',
          language_preference: 'urdu',
          status: 'active',
          total_orders: 3,
          total_spent: 75000,
          last_interaction: new Date().toISOString(),
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
        },
        {
          id: '2',
          phone_number: '923009876543',
          name: 'Sara Ali',
          email: null,
          language_preference: 'roman_urdu',
          status: 'active',
          total_orders: 1,
          total_spent: 25000,
          last_interaction: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
        },
        {
          id: '3',
          phone_number: '923331112222',
          name: 'Usman Malik',
          email: 'usman@business.com',
          language_preference: 'english',
          status: 'active',
          total_orders: 5,
          total_spent: 150000,
          last_interaction: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 60).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockCustomer = async (customerId: string) => {
    try {
      await customersApi.block(customerId);
      toast.success('Customer blocked successfully');
      fetchCustomers();
    } catch (error) {
      toast.error('Failed to block customer');
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone_number.includes(searchTerm) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout title="Customers">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Active Today</p>
            <p className="text-2xl font-bold text-green-600">
              {customers.filter((c) => {
                if (!c.last_interaction) return false;
                const today = new Date();
                const lastInt = new Date(c.last_interaction);
                return today.toDateString() === lastInt.toDateString();
              }).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(customers.reduce((sum, c) => sum + c.total_spent, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Avg. Order Value</p>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(
                customers.reduce((sum, c) => sum + c.total_spent, 0) /
                  Math.max(customers.reduce((sum, c) => sum + c.total_orders, 0), 1)
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Customer Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Customers</CardTitle>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-whatsapp-light w-64"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
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
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Language</TableHead>
                  <TableHead>Orders</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">
                          {customer.name || 'Unknown'}
                        </p>
                        {customer.email && (
                          <p className="text-xs text-gray-500">{customer.email}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {formatPhoneNumber(customer.phone_number)}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize text-gray-600">
                        {customer.language_preference.replace('_', ' ')}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-900 font-medium">
                      {customer.total_orders}
                    </TableCell>
                    <TableCell className="text-gray-900 font-medium">
                      {formatCurrency(customer.total_spent)}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {customer.last_interaction
                        ? timeAgo(customer.last_interaction)
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Badge status={customer.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleBlockCustomer(customer.id)}
                        >
                          <Ban className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Showing {filteredCustomers.length} customers
            </p>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
