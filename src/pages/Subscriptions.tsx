import React, { useState, useEffect } from 'react';
import { CreditCard, Calendar, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { subscriptionsApi } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { BusinessSubscription } from '../types';
import Navbar from '../components/Navbar';

const Subscriptions: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<BusinessSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await subscriptionsApi.getAll();
      if (response.data.success) {
        setSubscriptions(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error loading subscriptions",
        description: "Failed to load subscription data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePlan = () => {
    navigate('/plan-selection');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-success" />;
      case 'inactive':
        return <XCircle className="h-5 w-5 text-destructive" />;
      case 'cancelled':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-success bg-success/10 border-success/20';
      case 'inactive':
        return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'cancelled':
        return 'text-warning bg-warning/10 border-warning/20';
      default:
        return 'text-muted-foreground bg-muted/50 border-border';
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading subscriptions...</p>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Subscriptions</h1>
              <p className="text-muted-foreground mt-2">
                Manage your subscription plans
              </p>
            </div>
            <button
              onClick={handleChangePlan}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
            >
              <ExternalLink className="h-5 w-5" />
              Change Plan
            </button>
          </div>

          {/* Active Subscription Card */}
          {subscriptions.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {subscriptions
                .filter(sub => sub.status === 'active')
                .map((subscription) => {
                  const plan = typeof subscription.plan === 'object' ? subscription.plan : null;
                  const daysRemaining = subscription.endDate ? getDaysRemaining(subscription.endDate.toString()) : null;
                  
                  return (
                    <div
                      key={subscription._id}
                      className="bg-card rounded-xl shadow-lg border border-border overflow-hidden"
                    >
                      <div className="bg-gradient-primary p-6 text-white">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold">
                              {plan ? plan.name : 'Current Plan'}
                            </h3>
                            <p className="text-blue-100 mt-1">
                              Active subscription
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">
                              {plan ? formatCurrency(plan.price) : '$0'}
                            </div>
                            <div className="text-blue-100 text-sm">/month</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div>
                            <label className="text-sm text-muted-foreground">Start Date</label>
                            <p className="font-medium text-card-foreground">
                              {formatDate(subscription.startDate.toString())}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm text-muted-foreground">Next Billing</label>
                            <p className="font-medium text-card-foreground">
                              {subscription.endDate ? formatDate(subscription.endDate.toString()) : 'N/A'}
                            </p>
                          </div>
                        </div>
                        
                        {daysRemaining && (
                          <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Days remaining</span>
                              <span className="font-medium text-card-foreground">{daysRemaining} days</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2">
                              <div
                                className="bg-primary rounded-full h-2 transition-all duration-300"
                                style={{ width: `${Math.max(0, Math.min(100, (daysRemaining / 30) * 100))}%` }}
                              />
                            </div>
                          </div>
                        )}
                        
                        {plan && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-card-foreground">Plan Features</h4>
                            <div className="grid grid-cols-1 gap-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Products:</span>
                                <span className="font-medium">
                                  {plan.productsLimit === -1 ? 'Unlimited' : plan.productsLimit}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Customers:</span>
                                <span className="font-medium">
                                  {plan.customersLimit === -1 ? 'Unlimited' : plan.customersLimit}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-muted-foreground">Photos:</span>
                                <span className="font-medium">
                                  {plan.photoLimit === -1 ? 'Unlimited' : plan.photoLimit}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Subscription History */}
          <div className="bg-card rounded-xl shadow-md border border-border">
            <div className="p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-card-foreground">
                Subscription History
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Plan</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Start Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">End Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.map((subscription) => {
                    const plan = typeof subscription.plan === 'object' ? subscription.plan : null;
                    
                    return (
                      <tr key={subscription._id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="font-medium text-card-foreground">
                              {plan ? plan.name : 'Unknown Plan'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(subscription.status)}`}>
                            {getStatusIcon(subscription.status)}
                            <span className="ml-1 capitalize">{subscription.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-muted-foreground">
                            <Calendar className="h-4 w-4 mr-2" />
                            <span>{formatDate(subscription.startDate.toString())}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">
                          {subscription.endDate ? formatDate(subscription.endDate.toString()) : 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-card-foreground">
                          {plan ? formatCurrency(plan.price) : '$0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {subscriptions.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No subscriptions found</p>
                <button
                  onClick={handleChangePlan}
                  className="bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
                >
                  Select a Plan
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;