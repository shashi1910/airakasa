import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../api/cart';

const Layout = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Fetch cart to show item count badge
  const { data: cart } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCart(),
    enabled: !!user, // Only fetch if user is logged in
    retry: false,
  });

  const cartItemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen">
      <nav className="bg-gradient-to-r from-slate-600 to-slate-500 shadow-xl border-b-4 border-primary-500 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center px-3 py-2 text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent hover:from-primary-500 hover:to-primary-700 transition-all">
                <span className="text-primary-500">🍽️</span>
                <span className="ml-2">FoodMate</span>
              </Link>
              <div className="flex space-x-6 ml-10">
                <Link
                  to="/"
                  className={`inline-flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                    isActive('/') 
                      ? 'bg-primary-500 text-slate-800 shadow-lg' 
                      : 'text-cream-100 hover:text-primary-300 hover:bg-slate-500/50'
                  }`}
                >
                  Catalog
                </Link>
                <Link
                  to="/cart"
                  className={`inline-flex items-center px-3 py-2 rounded-lg font-medium transition-all relative ${
                    isActive('/cart') 
                      ? 'bg-primary-500 text-slate-800 shadow-lg' 
                      : 'text-cream-100 hover:text-primary-300 hover:bg-slate-500/50'
                  }`}
                >
                  <span>Cart</span>
                  {cartItemCount > 0 && (
                    <span className="ml-2 bg-teal-500 text-white text-xs font-bold rounded-full px-2.5 py-0.5 animate-scale-in shadow-lg min-w-[24px] text-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link
                  to="/orders"
                  className={`inline-flex items-center px-3 py-2 rounded-lg font-medium transition-all ${
                    isActive('/orders') 
                      ? 'bg-primary-500 text-slate-800 shadow-lg' 
                      : 'text-cream-100 hover:text-primary-300 hover:bg-slate-500/50'
                  }`}
                >
                  Orders
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <Link
                to="/profile"
                className="text-cream-100 hover:text-primary-300 px-4 py-2 rounded-lg font-medium transition-all hover:bg-slate-500/50"
              >
                {user?.email}
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
