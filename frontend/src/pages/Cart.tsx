import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';

const Cart = () => {
    const { items, removeFromCart, total, checkout } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const url = await checkout();
            // Check if mock or real stripe (Mock returns internal URL, Stripe returns external)
            if (url.startsWith('http')) {
                window.location.href = url;
            } else {
                navigate(url);
            }
        } catch (err) {
            alert("Checkout failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="text-center py-20">
                <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
                <button onClick={() => navigate('/')} className="text-pink-500 hover:underline">Continue Shopping</button>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Shopping Cart</h1>
                <button onClick={() => navigate('/')} className="text-gray-500 hover:text-black font-medium transition-colors">
                    &larr; Back to Shopping
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {items.map((item) => (
                    <div key={item.id} className="flex items-center p-6 border-b last:border-0 hover:bg-gray-50 transition-colors">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={item.image_url || `https://placehold.co/200?text=${item.name}`} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="ml-6 flex-grow">
                            <h3 className="font-bold text-lg">{item.name}</h3>
                            <p className="text-gray-500">¥{item.price.toLocaleString()} x {item.quantity}</p>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-lg mb-2">¥{(item.price * item.quantity).toLocaleString()}</p>
                            <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 w-full max-w-sm">
                    <div className="flex justify-between mb-4 text-xl font-bold">
                        <span>Total</span>
                        <span>¥{total.toLocaleString()}</span>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full bg-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-transform active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Processing..." : "Proceed to Checkout"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Cart;
