import { create } from 'zustand'
import { devtools, persist, createJSONStorage } from 'zustand/middleware'
import api from '../lib/api'
import useAuthStore from './authStore'

const useCartStore = create(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        
        // Sync with backend
        fetchCart: async () => {
            const isAuthenticated = useAuthStore.getState().isAuthenticated;
            if (!isAuthenticated) return;

            try {
                const res = await api.get('/cart');
                // Backend returns [{ id, quantity, product: {...} }, ...]
                // Frontend expects [{ id, name, price, image_url, quantity, selected, note }, ...]
                const currentItems = get().items;
                const formattedItems = res.data.data.map(item => {
                    const existing = currentItems.find(ci => ci.id === item.product.id);
                    return {
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        image_url: item.product.image_url,
                        quantity: item.quantity,
                        selected: existing ? existing.selected : true,
                        note: existing ? existing.note : ''
                    };
                });
                set({ items: formattedItems });
            } catch (error) {
                console.error("Failed to fetch cart", error);
            }
        },

        addItem: async (product) => {
            const { isAuthenticated, token } = useAuthStore.getState();
            console.log("addItem check auth:", isAuthenticated, !!token);
            if (!isAuthenticated || !token) {
                throw new Error("Login required to add items to cart.");
            }

            const items = get().items;
            const existingItem = items.find((item) => item.id === product.id);
            
            // Optimistic update
            if (existingItem) {
                const updatedItems = items.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
                set({ items: updatedItems });
            } else {
                set({ items: [...items, { ...product, quantity: 1, note: '', selected: true }] });
            }

            // Sync with backend (now guaranteed to be authenticated)
            try {
                await api.post('/cart', { productId: product.id, quantity: 1 });
            } catch (error) {
                console.error("Failed to sync add item", error);
            }
        },

        updateItemNote: (productId, note) => {
             const items = get().items.map(item => 
                 item.id === productId ? { ...item, note } : item
             );
             set({ items });
        },

        removeItem: async (productId) => {
             const isAuthenticated = useAuthStore.getState().isAuthenticated;
             
             // Optimistic update
             set({ items: get().items.filter(item => item.id !== productId) });

             if (isAuthenticated) {
                 try {
                     await api.delete(`/cart/${productId}`);
                 } catch (error) {
                     console.error("Failed to sync remove item", error);
                 }
             }
        },

        updateQuantity: async (productId, quantity) => {
             if (quantity <= 0) {
                 get().removeItem(productId);
                 return;
             }

             const isAuthenticated = useAuthStore.getState().isAuthenticated;

             // Optimistic update
             const items = get().items.map(item => 
                 item.id === productId ? { ...item, quantity } : item
             );
             set({ items });

             if (isAuthenticated) {
                 try {
                     await api.put('/cart', { productId, quantity });
                 } catch (error) {
                     console.error("Failed to sync update quantity", error);
                 }
             }
        },

        clearCart: async () => {
            set({ items: [] });
            const isAuthenticated = useAuthStore.getState().isAuthenticated;
            if (isAuthenticated) {
                try {
                    await api.delete('/cart');
                } catch (error) {
                    console.error("Failed to clear backend cart", error);
                }
            }
        },

        // Toggle selection for a single item
        toggleSelectItem: (productId) => {
            const items = get().items.map(item =>
                item.id === productId ? { ...item, selected: !item.selected } : item
            );
            set({ items });
        },

        // Toggle selection for all items in the cart
        toggleSelectAll: (isSelected) => {
            const items = get().items.map(item => ({ ...item, selected: isSelected }));
            set({ items });
        },

        // Clear only selected items (run after successful checkout)
        clearSelectedItems: async () => {
            const isAuthenticated = useAuthStore.getState().isAuthenticated;
            const selectedItems = get().items.filter(item => item.selected);
            const remainingItems = get().items.filter(item => !item.selected);

            // Optimistic update local state
            set({ items: remainingItems });

            if (isAuthenticated) {
                try {
                    // Sequentially delete selected items from backend
                    for (const item of selectedItems) {
                        await api.delete(`/cart/${item.id}`);
                    }
                } catch (error) {
                    console.error("Failed to sync clear selected items", error);
                }
            }
        },

        // Selectors
        getSelectedItems: () => {
            return get().items.filter(item => item.selected);
        },

        getSelectedTotalPrice: () => {
            return get().items
                .filter(item => item.selected)
                .reduce((total, item) => total + (item.price * item.quantity), 0);
        },

        getSelectedCount: () => {
            return get().items.filter(item => item.selected).length;
        },

        getTotalPrice: () => {
             return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        
        getItemCount: () => {
            return get().items.length;
        }
      }),
      {
        name: 'cart-storage',
        storage: createJSONStorage(() => sessionStorage),
      }
    )
  )
)

export default useCartStore
