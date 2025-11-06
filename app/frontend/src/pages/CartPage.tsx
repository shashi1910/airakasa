import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cart';
import { checkoutApi } from '../api/checkout';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useToast } from '../hooks/useToast';

const CartPage = () => {
  const navigate = useNavigate();
  const [checkoutError, setCheckoutError] = useState<string>('');
  const queryClient = useQueryClient();
  const { showToast, ToastComponent } = useToast();

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
  });

  const updateCartMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.updateCartItem(itemId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['items'] }); // Refresh items to update stock
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Failed to update cart. Please try again.';
      showToast(errorMessage, 'error');
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (itemId: string) => cartApi.removeFromCart(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['items'] }); // Refresh items to update stock
      showToast('Item removed from cart', 'info');
    },
    onError: (_error: any) => {
      showToast('Failed to remove item', 'error');
    },
  });

  const checkoutMutation = useMutation({
    mutationFn: () => checkoutApi.checkout(),
    onSuccess: (data) => {
      if (data.status === 'SUCCESS') {
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['items'] }); // Refresh items to update stock
        showToast(`Order placed successfully! Order ID: ${data.orderId.slice(0, 8)}`, 'success');
        setTimeout(() => navigate('/orders'), 1500);
      } else {
        const errorMsg = `Some items are not available: ${data.issues.map((i) => `${i.requested} requested, only ${i.available} available`).join(', ')}`;
        setCheckoutError(errorMsg);
        showToast('Some items are out of stock', 'error');
      }
    },
    onError: (error: any) => {
      const errorMessage = error.message || 'Checkout failed. Please try again.';
      setCheckoutError(errorMessage);
      showToast(errorMessage, 'error');
    },
  });

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  const subtotal = cart?.items.reduce(
    (sum, item) => sum + item.quantity * item.item.priceInPaise,
    0
  ) || 0;

  if (isLoading) {
    return <div className="text-center py-12">Loading cart...</div>;
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <h1 className="text-3xl font-bold mb-4">Your Cart</h1>
        <p className="text-gray-500 mb-4">Your cart is empty</p>
        <button
          onClick={() => navigate('/')}
          className="btn-primary px-6 py-2 rounded-md transition-all"
        >
          Browse Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
          Your Cart
        </h1>
        <p className="text-slate-600">{cart.items.length} item{cart.items.length !== 1 ? 's' : ''} in your cart</p>
      </div>

      {checkoutError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-5 py-4 rounded-lg mb-6 animate-slide-up shadow-lg">
          <div className="flex items-start">
            <span className="text-red-500 mr-3 text-xl">⚠️</span>
            <div className="flex-1">
              <p className="font-bold mb-1 text-lg">Checkout Failed</p>
              <p className="text-sm whitespace-pre-line">{checkoutError}</p>
            </div>
            <button
              onClick={() => setCheckoutError('')}
              className="text-red-500 hover:text-red-700 ml-2 text-xl font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-sage-200/50">
        <div className="divide-y divide-gray-200">
          {cart.items.map((cartItem) => (
            <div key={cartItem.id} className="p-6 flex items-center justify-between hover:bg-gradient-to-r hover:from-cream-50 hover:to-sage-50 transition-all border-b border-sage-100 last:border-b-0">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-bold text-lg text-slate-700">{cartItem.item.name}</h3>
                  {cartItem.quantity > cartItem.item.stock && (
                    <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full border border-red-200">
                      Stock issue
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-sm mb-2 line-clamp-1">{cartItem.item.description || 'Delicious meal'}</p>
                <div className="flex items-center space-x-4">
                  <p className="text-teal-600 font-bold">
                    {formatPrice(cartItem.item.priceInPaise)} <span className="text-slate-500 text-sm font-normal">each</span>
                  </p>
                  <p className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                    Stock: {cartItem.item.stock}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-3 bg-sage-50 rounded-lg p-2">
                  <button
                    onClick={() =>
                      updateCartMutation.mutate({
                        itemId: cartItem.itemId,
                        quantity: Math.max(0, cartItem.quantity - 1),
                      })
                    }
                    disabled={updateCartMutation.isPending}
                    className="w-10 h-10 rounded-lg border-2 border-sage-300 hover:bg-sage-200 disabled:opacity-50 transition-all font-bold text-slate-700 hover:scale-110"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-bold text-lg text-slate-700">{cartItem.quantity}</span>
                  <button
                    onClick={() =>
                      updateCartMutation.mutate({
                        itemId: cartItem.itemId,
                        quantity: cartItem.quantity + 1,
                      })
                    }
                    disabled={updateCartMutation.isPending || cartItem.item.stock <= cartItem.quantity}
                    className="w-10 h-10 rounded-lg border-2 border-sage-300 hover:bg-sage-200 disabled:opacity-50 transition-all font-bold text-slate-700 hover:scale-110"
                    title={cartItem.item.stock <= cartItem.quantity ? 'Maximum available stock reached' : 'Increase quantity'}
                  >
                    +
                  </button>
                </div>
                <div className="text-right min-w-[100px]">
                  <p className="text-xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                    {formatPrice(cartItem.quantity * cartItem.item.priceInPaise)}
                  </p>
                </div>
                <button
                  onClick={() => removeFromCartMutation.mutate(cartItem.itemId)}
                  disabled={removeFromCartMutation.isPending}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50 px-3 py-2 rounded-lg hover:bg-red-50 transition-all font-semibold"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="p-6 bg-gradient-to-r from-primary-50 via-cream-50 to-sage-50 border-t-4 border-primary-500">
          <div className="flex justify-between items-center mb-6">
            <span className="text-2xl font-bold text-slate-700">Subtotal:</span>
            <span className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
              {formatPrice(subtotal)}
            </span>
          </div>
          <button
            onClick={() => {
              setCheckoutError('');
              checkoutMutation.mutate();
            }}
            disabled={checkoutMutation.isPending}
            className="w-full btn-primary py-4 rounded-xl disabled:opacity-50 font-bold text-lg transition-all shadow-lg"
          >
            {checkoutMutation.isPending ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing your order...
              </span>
            ) : (
              '💳 Pay & Proceed to Checkout'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
