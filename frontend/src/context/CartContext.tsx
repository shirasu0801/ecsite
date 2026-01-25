import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

export interface CartItem {
    id: number;
    name: string;
    price: number;
    image_url?: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: number) => void;
    updateQuantity: (id: number, quantity: number) => void;
    clearCart: () => void;
    checkout: () => Promise<string>; // Returns checkout URL
    total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const { user, isLoading } = useAuth();

    // Load cart when user changes
    useEffect(() => {
        if (isLoading) return;
        const key = user ? `cart_${user.id}` : 'cart_guest';
        const stored = localStorage.getItem(key);
        if (stored) {
            setItems(JSON.parse(stored));
        } else {
            setItems([]);
        }
    }, [user, isLoading]);

    // Save cart when items change
    useEffect(() => {
        if (isLoading) return;
        const key = user ? `cart_${user.id}` : 'cart_guest';
        localStorage.setItem(key, JSON.stringify(items));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    const addToCart = (newItem: CartItem) => {
        setItems(prev => {
            const existing = prev.find(item => item.id === newItem.id);
            if (existing) {
                return prev.map(item =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + newItem.quantity }
                        : item
                );
            }
            return [...prev, newItem];
        });
    };

    const removeFromCart = (id: number) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, quantity: number) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const checkout = async () => {
        try {
            const res = await api.post('/orders/checkout', {
                items: items.map(item => ({
                    product_id: item.id,
                    quantity: item.quantity
                }))
            });
            return res.data.checkout_url;
        } catch (err) {
            console.error("Checkout error:", err);
            throw err;
        }
    };

    return (
        <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, checkout, total }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
