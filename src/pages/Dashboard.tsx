import React, { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, CreditCard, Camera, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { dashboardApi } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { DashboardMetrics } from '../types';
import Navbar from '../components/Navbar';

const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await dashboardApi.getMetrics();
      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error loading dashboard",
        description: "Failed to load dashboard metrics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getBusinessName = () => {
    const business = localStorage.getItem('business');
    return business ? JSON.parse(business).name : 'Business';
  };

  const getPhotoUsagePercentage = () => {
    if (!metrics) return 0;
    if (metrics.photosLimit === -1) return 0; // Unlimited
    return (metrics.photosUsed / metrics.photosLimit) * 100;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'processing':
        return 'text-warning';
      case 'pending':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  const metricCards = [
    {
      title: 'Total Products',
      value: metrics?.totalProducts || 0,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Customers',
      value: metrics?.totalCustomers || 0,
      icon: Users,
      color: 'text-success',
      bgColor: 'bg-success/10',
    },
    {
      title: 'Total Orders',
      value: metrics?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      title: 'Active Subscriptions',
      value: metrics?.activeSubscriptions || 0,
      icon: CreditCard,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              Welcome back, {getBusinessName()}!
            </h1>
            <p className="text-muted-foreground mt-2">
              Here's an overview of your business performance
            </p>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {metricCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="bg-card rounded-xl shadow-md p-6 border border-border hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {card.title}
                      </p>
                      <p className="text-3xl font-bold text-card-foreground mt-2">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${card.bgColor}`}>
                      <Icon className={`h-6 w-6 ${card.color}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Photo Usage */}
          <div className="bg-card rounded-xl shadow-md p-6 border border-border mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">
                Photo Storage Usage
              </h2>
              <Camera className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {metrics?.photosUsed || 0} of {metrics?.photosLimit === -1 ? '∞' : metrics?.photosLimit} photos used
                </span>
                <span className="text-card-foreground">
                  {metrics?.photosLimit === -1 ? 'Unlimited' : `${getPhotoUsagePercentage().toFixed(1)}%`}
                </span>
              </div>
              {metrics?.photosLimit !== -1 && (
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary rounded-full h-2 transition-all duration-300"
                    style={{ width: `${Math.min(getPhotoUsagePercentage(), 100)}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-card rounded-xl shadow-md border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-card-foreground">
                Recent Orders
              </h2>
            </div>
            <div className="p-6">
              {metrics?.recentOrders && metrics.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {metrics.recentOrders.map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-card-foreground">
                          Order #{order._id.slice(-6)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {typeof order.customer === 'object' ? order.customer.name : 'Customer'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-card-foreground">
                          {formatCurrency(order.total)}
                        </p>
                        <p className={`text-sm ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No recent orders</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;