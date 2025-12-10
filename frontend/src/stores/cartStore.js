import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

const useCartStore = create(
  devtools(
    persist(
      (set, get) => ({
        items: [],
        
        addItem: (product) => {
            const items = get().items;
            const existingItem = items.find((item) => item.id === product.id);

            if (existingItem) {
                const updatedItems = items.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
                set({ items: updatedItems });
            } else {
                set({ items: [...items, { ...product, quantity: 1 }] });
            }
        },

        removeItem: (productId) => {
             set({ items: get().items.filter(item => item.id !== productId) });
        },

        updateQuantity: (productId, quantity) => {
             if (quantity <= 0) {
                 get().removeItem(productId);
                 return;
             }
             const items = get().items.map(item => 
                 item.id === productId ? { ...item, quantity } : item
             );
             set({ items });
        },

        clearCart: () => set({ items: [] }),

        getTotalPrice: () => {
             return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
        },
        
        getItemCount: () => {
            return get().items.reduce((total, item) => total + item.quantity, 0);
        }
      }),
      {
        name: 'cart-storage',
      }
    )
  )
)

export default useCartStore
