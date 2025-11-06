import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { catalogApi } from '../api/catalog';
import { cartApi } from '../api/cart';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '../hooks/useToast';

const CatalogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const { showToast, ToastComponent } = useToast();

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => catalogApi.getCategories(),
  });

  const { data: itemsData, isLoading, error: itemsError } = useQuery({
    queryKey: ['items', selectedCategory, searchQuery],
    queryFn: () =>
      catalogApi.getItems({
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        q: searchQuery || undefined,
        page: 1,
        limit: 50,
      }),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartApi.addToCart(itemId, quantity),
    onSuccess: (_, variables) => {
      try {
        // Invalidate cart query to update badge
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        
        // Find item name before potentially losing itemsData
        const item = itemsData?.items.find(i => i.id === variables.itemId);
        const itemName = item?.name || 'Item';
        
        // Show toast
        showToast(`${itemName} added to cart!`, 'success');
        
        // Visual feedback on button - use setTimeout to avoid React conflicts
        setTimeout(() => {
          try {
            const button = document.querySelector(`[data-item-id="${variables.itemId}"]`) as HTMLElement;
            if (button && button.textContent) {
              const originalText = button.textContent;
              const originalClasses = button.className;
              button.textContent = '✓ Added!';
              button.className = originalClasses.replace(/btn-primary/g, 'bg-forest-500 text-white');
              setTimeout(() => {
                if (button) {
                  button.textContent = originalText;
                  button.className = originalClasses;
                }
              }, 2000);
            }
          } catch (btnError) {
            // Silently fail button update - button feedback is non-critical
          }
        }, 100);
        
        // Invalidate items query after a delay to avoid blank screen
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['items'] });
        }, 500);
      } catch (error) {
        // Log error but don't break the flow
        if (process.env.NODE_ENV === 'development') {
          console.error('Error in add to cart success handler:', error);
        }
      }
    },
    onError: (error: any) => {
      const errorMsg = error.message || 'Failed to add to cart';
      showToast(errorMsg, 'error');
    },
  });

  const formatPrice = (paise: number) => {
    return `₹${(paise / 100).toFixed(2)}`;
  };

  const handleAddToCart = (itemId: string, itemName: string) => {
    addToCartMutation.mutate({ itemId, quantity: 1 });
  };

  return (
    <div className="animate-fade-in">
      {ToastComponent}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-slate-700 to-slate-500 bg-clip-text text-transparent">
          Food Catalog
        </h1>
        <p className="text-slate-600">Discover delicious meals from around the world</p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search for dishes, ingredients..."
            className="input-premium w-full pl-12"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2.5 rounded-lg transition-all font-semibold shadow-sm ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-slate-800 shadow-lg transform scale-105'
                : 'bg-white text-slate-700 hover:bg-sage-100 border-2 border-sage-200'
            }`}
          >
            All
          </button>
          {categories?.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-2.5 rounded-lg transition-all font-semibold shadow-sm ${
                selectedCategory === category.id
                  ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-slate-800 shadow-lg transform scale-105'
                  : 'bg-white text-slate-700 hover:bg-sage-100 border-2 border-sage-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {itemsError && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-semibold">Error loading items. Please refresh the page.</p>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <svg className="animate-spin h-8 w-8 text-primary-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600">Loading items...</p>
        </div>
      ) : itemsData?.items && itemsData.items.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {itemsData.items.map((item, index) => (
            <div
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden card-hover animate-slide-up border border-sage-200/50"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="relative h-48 bg-gradient-to-br from-cream-100 to-sage-100 overflow-hidden">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-slate-400 text-sm">🍽️ No image</span>
                  </div>
                )}
                {item.stock > 0 && item.stock < 10 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                    Low Stock!
                  </span>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-slate-700 line-clamp-1">{item.name}</h3>
                <p className="text-slate-600 text-sm mb-3 line-clamp-2 min-h-[2.5rem]">{item.description || 'Delicious meal waiting for you'}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-teal-500 bg-clip-text text-transparent">
                    {formatPrice(item.priceInPaise)}
                  </span>
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${
                    item.stock === 0 
                      ? 'bg-red-100 text-red-700 border border-red-200' 
                      : item.stock < 10 
                      ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                      : 'bg-forest-100 text-forest-700 border border-forest-200'
                  }`}>
                    {item.stock > 0 ? `${item.stock} left` : 'Out of stock'}
                  </span>
                </div>
                <button
                  data-item-id={item.id}
                  onClick={() => handleAddToCart(item.id, item.name)}
                  disabled={item.stock === 0 || addToCartMutation.isPending}
                  className="w-full btn-primary py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                >
                  {addToCartMutation.isPending ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Adding...
                    </span>
                  ) : item.stock === 0 ? (
                    'Out of Stock'
                  ) : (
                    'Add to Cart'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : !isLoading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-slate-600 text-lg">No items found</p>
          <p className="text-slate-500 text-sm mt-2">Try adjusting your search or category filter</p>
        </div>
      ) : null}
    </div>
  );
};

export default CatalogPage;
