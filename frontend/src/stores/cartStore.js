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
                // Frontend expects [{ id, name, price, image_url, quantity }, ...]
                const formattedItems = res.data.data.map(item => ({
                    id: item.product.id, // Product ID
                    name: item.product.name,
                    price: item.product.price,
                    image_url: item.product.image_url,
                    quantity: item.quantity
                }));
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
                set({ items: [...items, { ...product, quantity: 1, note: '' }] });
            }

            // Sync with backend (now guaranteed to be authenticated)
            try {
                await api.post('/cart', { productId: product.id, quantity: 1 });
                // Note sync not supported in add yet, assuming empty initial note
            } catch (error) {
                console.error("Failed to sync add item", error);
            }
        },

        updateItemNote: (productId, note) => {
             const items = get().items.map(item => 
                 item.id === productId ? { ...item, note } : item
             );
             set({ items });
             // Ideally sync this to backend if persistent cart supports notes per item in storage
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
