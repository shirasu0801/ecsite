import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../api';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';

const OrderSuccess = () => {
    const [searchParams] = useSearchParams();
    const session_id = searchParams.get('session_id');
    const order_id = searchParams.get('order_id');
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<'pending' | 'success' | 'failed'>('pending');
    const { clearCart } = useCart();

    useEffect(() => {
        if (!session_id || !order_id) return;

        const verify = async () => {
            try {
                const res = await api.get(`/orders/verify?session_id=${session_id}&order_id=${order_id}`);
                if (res.data.status === 'paid') {
                    setStatus('success');
                    clearCart();
                } else {
                    setStatus('failed');
                }
            } catch (err) {
                console.error(err);
                setStatus('failed');
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [session_id, order_id]);

    if (loading) return <div className="text-center py-20">Verifying Payment...</div>;

    return (
        <div className="text-center py-20 min-h-[60vh] flex flex-col items-center justify-center">
            {status === 'success' ? (
                <>
                    <div className="bg-green-100 text-green-500 p-6 rounded-full mb-6 animate-bounce">
                        <CheckCircle className="w-16 h-16" />
                    </div>
                    <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
                    <p className="text-gray-500 text-lg mb-8">Thank you for your purchase. A confirmation email has been sent.</p>
                    <div className="space-x-4">
                        <Link to="/" className="bg-black text-white px-8 py-3 rounded-full font-bold hover:bg-gray-800 transition-colors">Continue Shopping</Link>
                        <Link to="/cart" className="text-gray-500 hover:text-black font-medium">View Orders</Link>
                    </div>
                </>
            ) : (
                <>
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Payment Verification Failed</h1>
                    <p className="mb-4">Please contact support or try again.</p>
                    <Link to="/cart" className="bg-black text-white px-8 py-3 rounded-full font-bold">Return to Cart</Link>
                </>
            )}
        </div>
    );
};

export default OrderSuccess;
