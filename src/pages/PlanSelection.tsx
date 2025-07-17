import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Crown, Zap, Star } from 'lucide-react';
import { plansApi, subscriptionsApi } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { Plan } from '../types';

const PlanSelection: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await plansApi.getAll();
      if (response.data.success) {
        setPlans(response.data.data);
      }
    } catch (error) {
      toast({
        title: "Error loading plans",
        description: "Failed to load subscription plans",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlanId(planId);
    
    try {
      const response = await subscriptionsApi.create({ planId });
      
      if (response.data.success) {
        toast({
          title: "Plan selected successfully",
          description: "Your subscription has been activated!",
        });
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Failed to select plan",
        description: error.response?.data?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSelectedPlanId(null);
    }
  };

  const getPlanIcon = (planName: string) => {
    const name = planName.toLowerCase();
    if (name.includes('premium') || name.includes('pro')) return Crown;
    if (name.includes('enterprise') || name.includes('business')) return Star;
    return Zap;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Select the perfect plan for your business needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = getPlanIcon(plan.name);
            const isPopular = plan.name.toLowerCase().includes('pro') || plan.name.toLowerCase().includes('business');
            
            return (
              <div
                key={plan._id}
                className={`relative bg-card rounded-2xl shadow-xl overflow-hidden transform transition-all duration-300 hover:scale-105 ${
                  isPopular ? 'ring-2 ring-primary' : ''
                }`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
                    Most Popular
                  </div>
                )}
                
                <div className={`p-8 ${isPopular ? 'pt-12' : ''}`}>
                  <div className="flex items-center justify-center mb-6">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-card-foreground text-center mb-2">
                    {plan.name}
                  </h3>
                  
                  <div className="text-center mb-6">
                    <span className="text-4xl font-extrabold text-primary">
                      ${plan.price}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  
                  <p className="text-muted-foreground text-center mb-8">
                    {plan.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-success mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-card-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <div className="space-y-2 mb-8 text-sm text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Products:</span>
                      <span>{plan.productsLimit === -1 ? 'Unlimited' : plan.productsLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Customers:</span>
                      <span>{plan.customersLimit === -1 ? 'Unlimited' : plan.customersLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Photos:</span>
                      <span>{plan.photoLimit === -1 ? 'Unlimited' : plan.photoLimit}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleSelectPlan(plan._id)}
                    disabled={selectedPlanId === plan._id}
                    className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                      isPopular
                        ? 'bg-primary text-primary-foreground hover:bg-primary-dark'
                        : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {selectedPlanId === plan._id ? 'Activating...' : 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PlanSelection;