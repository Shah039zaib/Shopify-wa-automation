'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { dashboardApi } from '@/services/api';
import { formatCurrency } from '@/lib/utils';
import {
  Users,
  MessageSquare,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface Stats {
  total_customers: number;
  active_conversations: number;
  total_orders: number;
  total_revenue: number;
  orders_today: number;
  revenue_today: number;
  new_customers_today: number;
  messages_today: number;
}

const mockChartData = [
  { name: 'Mon', revenue: 12000, orders: 4 },
  { name: 'Tue', revenue: 18000, orders: 6 },
  { name: 'Wed', revenue: 15000, orders: 5 },
  { name: 'Thu', revenue: 25000, orders: 8 },
  { name: 'Fri', revenue: 22000, orders: 7 },
  { name: 'Sat', revenue: 30000, orders: 10 },
  { name: 'Sun', revenue: 28000, orders: 9 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set mock data for demo
      setStats({
        total_customers: 156,
        active_conversations: 23,
        total_orders: 89,
        total_revenue: 450000,
        orders_today: 5,
        revenue_today: 25000,
        new_customers_today: 8,
        messages_today: 145,
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: stats ? formatCurrency(stats.total_revenue) : '-',
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-500',
    },
    {
      title: 'Total Orders',
      value: stats?.total_orders || '-',
      change: '+8.2%',
      trend: 'up',
      icon: ShoppingBag,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Customers',
      value: stats?.total_customers || '-',
      change: '+15.3%',
      trend: 'up',
      icon: Users,
      color: 'bg-purple-500',
    },
    {
      title: 'Active Chats',
      value: stats?.active_conversations || '-',
      change: '-2.4%',
      trend: 'down',
      icon: MessageSquare,
      color: 'bg-orange-500',
    },
  ];

  return (
    <MainLayout title="Dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {loading ? (
                      <span className="animate-pulse bg-gray-200 h-8 w-24 block rounded"></span>
                    ) : (
                      stat.value
                    )}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-500" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-400 ml-1">vs last week</span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#25D366"
                    fill="#25D36620"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <DollarSign className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Revenue Today</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats ? formatCurrency(stats.revenue_today) : '-'}
                    </p>
                  </div>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>

              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Orders Today</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.orders_today || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">New Customers</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.new_customers_today || '-'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Messages Today</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {stats?.messages_today || '-'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
