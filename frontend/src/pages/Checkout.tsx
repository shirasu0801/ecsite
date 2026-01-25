import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { CreditCard, Lock } from 'lucide-react';

const Checkout = () => {
    const { total } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searchParams] = useSearchParams();
    const order_id = searchParams.get('order_id'); // If coming from backend response redirect? Not quite.

    // Backend redirect logic: 
    // Current mock backend returns: checkout_url = "http://localhost:5174/orders/success?..."
    // We want it to be "http://localhost:5174/checkout?order_id=..."
    // Then this page POSTs to /orders/pay or simply redirects to success if just visual.

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate processing delay
        setTimeout(() => {
            setLoading(false);
            // Redirect to success mock
            // In a real app we'd call a backend endpoint to confirm 'payment' or Stripe does it via webhook
            // Since we are mocking the "Payment Page", we can simply redirect to the success URL that the backend originally wanted to give us.
            // Simplified: The backend gave us an order ID. We just go to success.
            navigate(`/orders/success?session_id=mock_session_manual&order_id=${order_id}`);
        }, 1500);
    };

    if (!order_id) {
        return <div className="text-center py-20">Invalid Checkout Session</div>;
    }

    return (
        <div className="max-w-xl mx-auto py-12">
            <h1 className="text-3xl font-bold mb-8 flex items-center">
                <Lock className="w-8 h-8 mr-3 text-green-500" /> Secure Checkout
            </h1>

            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <div className="mb-8 border-b pb-8">
                    <h2 className="text-lg font-semibold text-gray-500 mb-2">Total Amount</h2>
                    <p className="text-4xl font-bold">¥{total.toLocaleString()}</p>
                </div>

                <form onSubmit={handlePayment} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium mb-1">Card Number (Mock)</label>
                        <div className="relative">
                            <CreditCard className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                            <input type="text" placeholder="4242 4242 4242 4242" className="w-full pl-12 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none font-mono" required />
                        </div>
                    </div>
                    <div className="flex space-x-4">
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">Expiration</label>
                            <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none" required />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium mb-1">CVC</label>
                            <input type="text" placeholder="123" className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                        <input type="text" placeholder={user?.email || "Name"} className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-black outline-none" required />
                    </div>

                    <button disabled={loading} className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all active:scale-95 disabled:opacity-50 mt-4">
                        {loading ? "Processing Payment..." : `Pay ¥${total.toLocaleString()}`}
                    </button>
                </form>
            </div>
            <p className="text-center text-gray-400 text-sm mt-8">
                This is a mock payment screen. No real money is charged.
            </p>
        </div>
    );
};

export default Checkout;
