import React, { useState, useEffect } from 'react';
import { Plus, Search, Package, Calendar, DollarSign, User, CheckCircle, Clock, XCircle } from 'lucide-react';
import { ordersApi, customersApi, productsApi } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { Order, Customer, Product } from '../types';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    customerId: '',
    productIds: [] as string[],
    quantities: {} as { [key: string]: number },
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersResponse, customersResponse, productsResponse] = await Promise.all([
        ordersApi.getAll(),
        customersApi.getAll(),
        productsApi.getAll(),
      ]);

      if (ordersResponse.data.success) {
        setOrders(ordersResponse.data.data);
      }
      if (customersResponse.data.success) {
        setCustomers(customersResponse.data.data);
      }
      if (productsResponse.data.success) {
        setProducts(productsResponse.data.data);
      }
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load orders data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      productIds: [],
      quantities: {},
    });
  };

  const handleOpenModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleProductToggle = (productId: string) => {
    if (formData.productIds.includes(productId)) {
      setFormData({
        ...formData,
        productIds: formData.productIds.filter(id => id !== productId),
        quantities: { ...formData.quantities, [productId]: undefined },
      });
    } else {
      setFormData({
        ...formData,
        productIds: [...formData.productIds, productId],
        quantities: { ...formData.quantities, [productId]: 1 },
      });
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setFormData({
      ...formData,
      quantities: { ...formData.quantities, [productId]: quantity },
    });
  };

  const calculateTotal = () => {
    return formData.productIds.reduce((total, productId) => {
      const product = products.find(p => p._id === productId);
      const quantity = formData.quantities[productId] || 1;
      return total + (product?.price || 0) * quantity;
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.customerId || formData.productIds.length === 0) {
      toast({
        title: "Invalid order",
        description: "Please select a customer and at least one product",
        variant: "destructive",
      });
      return;
    }

    try {
      const orderData = {
        customerId: formData.customerId,
        products: formData.productIds.map(productId => ({
          productId,
          quantity: formData.quantities[productId] || 1,
          price: products.find(p => p._id === productId)?.price || 0,
        })),
        total: calculateTotal(),
      };

      await ordersApi.create(orderData);
      toast({
        title: "Order created",
        description: "Order has been created successfully",
      });

      handleCloseModal();
      fetchData();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-warning" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success bg-success/10';
      case 'processing':
        return 'text-warning bg-warning/10';
      case 'cancelled':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-muted-foreground bg-muted/50';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'text-success bg-success/10';
      case 'failed':
        return 'text-destructive bg-destructive/10';
      default:
        return 'text-warning bg-warning/10';
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderCode = order._id.slice(-6);
    const customerName = typeof order.customer === 'object' ? order.customer.name : '';
    return orderCode.includes(searchTerm) || customerName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading orders...</p>
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
              <h1 className="text-3xl font-bold text-foreground">Orders</h1>
              <p className="text-muted-foreground mt-2">
                Manage your customer orders
              </p>
            </div>
            <button
              onClick={handleOpenModal}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              New Order
            </button>
          </div>

          {/* Search */}
          <div className="bg-card rounded-xl shadow-md p-6 border border-border mb-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search orders by code or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-card rounded-xl shadow-md border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Order Code</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Customer</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Payment</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Items</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-mono text-sm">#{order._id.slice(-6)}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-medium">
                            {typeof order.customer === 'object' ? order.customer.name : 'Customer'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span className="font-semibold text-card-foreground">
                            {formatCurrency(order.total)}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span>{formatDate(order.orderDate.toString())}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm text-muted-foreground">
                          {order.products.length} item{order.products.length !== 1 ? 's' : ''}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No orders match your search' : 'No orders yet'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="New Order"
        size="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Customer
            </label>
            <select
              required
              value={formData.customerId}
              onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Products
            </label>
            <div className="border border-input rounded-lg max-h-60 overflow-y-auto">
              {products.map(product => (
                <div key={product._id} className="p-4 border-b border-border last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={product._id}
                        checked={formData.productIds.includes(product._id)}
                        onChange={() => handleProductToggle(product._id)}
                        className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                      />
                      <label htmlFor={product._id} className="ml-3 flex-1">
                        <div className="font-medium text-card-foreground">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{formatCurrency(product.price)}</div>
                      </label>
                    </div>
                    {formData.productIds.includes(product._id) && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-muted-foreground">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.quantities[product._id] || 1}
                          onChange={(e) => handleQuantityChange(product._id, parseInt(e.target.value))}
                          className="w-16 px-2 py-1 border border-input rounded text-sm"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {formData.productIds.length > 0 && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium text-card-foreground">Total:</span>
                <span className="text-xl font-bold text-primary">
                  {formatCurrency(calculateTotal())}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Create Order
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Orders;