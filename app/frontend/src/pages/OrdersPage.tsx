import { useQuery } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: () => ordersApi.getOrders(),
  });

  const { data: orderDetails } = useQuery({
    queryKey: ['order', selectedOrder],
    queryFn: () => ordersApi.getOrder(selectedOrder!),
    enabled: !!selectedOrder,
  });

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <svg className="animate-spin h-12 w-12 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-600 text-lg">Loading your orders...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-20 animate-fade-in">
        <div className="max-w-md mx-auto">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
            Your Orders
          </h1>
          <p className="text-slate-600 text-lg">You haven't placed any orders yet</p>
          <button
            onClick={() => navigate('/')}
            className="mt-6 btn-primary px-6 py-3 rounded-lg"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
          Your Orders
        </h1>
        <p className="text-slate-600">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
      </div>

      <div className="space-y-4">
        {orders.map((order, index) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-lg p-6 cursor-pointer card-hover animate-slide-up border border-sage-200/50"
            style={{ animationDelay: `${index * 0.05}s` }}
            onClick={() => setSelectedOrder(order.id)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-xl text-slate-700 mb-1">Order #{order.id.slice(0, 8).toUpperCase()}</h3>
                <p className="text-slate-500 text-sm mb-2">{formatDate(order.createdAt)}</p>
                <p className="text-sm text-slate-600 bg-sage-50 px-3 py-1 rounded-full inline-block">
                  {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent mb-2">
                  {formatPrice(order.totalInPaise)}
                </p>
                <span
                  className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${
                    order.status === 'DELIVERED'
                      ? 'bg-gradient-to-r from-forest-400 to-forest-500 text-white'
                      : 'bg-gradient-to-r from-primary-400 to-primary-500 text-slate-800'
                  }`}
                >
                  {order.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedOrder && orderDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-primary-500 animate-scale-in">
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent mb-1">
                    Order Details
                  </h2>
                  <p className="text-slate-500">#{orderDetails.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-slate-500 hover:text-slate-700 text-2xl font-bold w-10 h-10 rounded-full hover:bg-slate-100 transition-all"
                >
                  ✕
                </button>
              </div>
              <p className="text-slate-600 mb-6 pb-4 border-b border-sage-200">Placed on: {formatDate(orderDetails.createdAt)}</p>

              <div className="space-y-3 mb-6">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center p-4 bg-sage-50 rounded-lg border border-sage-200">
                    <div>
                      <p className="font-bold text-slate-700 mb-1">{item.item.name}</p>
                      <p className="text-sm text-slate-600">
                        {item.quantity} × {formatPrice(item.unitPriceInPaise)}
                      </p>
                    </div>
                    <p className="font-bold text-lg bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                      {formatPrice(item.quantity * item.unitPriceInPaise)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t-2 border-primary-500 flex justify-between items-center bg-gradient-to-r from-primary-50 to-cream-50 p-4 rounded-lg">
                <span className="text-2xl font-bold text-slate-700">Total:</span>
                <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                  {formatPrice(orderDetails.totalInPaise)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
