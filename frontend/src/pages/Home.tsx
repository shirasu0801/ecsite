import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { ShoppingCart, CreditCard } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface Product {
    id: number;
    name: string;
    price: number;
    image_url: string;
}

const Home = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, items, checkout } = useCart();
    const { user, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const handleQuickCheckout = async () => {
        try {
            const url = await checkout();
            window.location.href = url;
        } catch (e) {
            alert("Couldn't start checkout.");
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login');
            return;
        }
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products/');
                setProducts(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [user, authLoading, navigate]);

    if (authLoading || loading) return <div className="text-center py-20">Loading...</div>;

    return (
        <div>
            <section className="mb-12 text-center relative">
                <h1 className="text-5xl font-extrabold mb-4 bg-gradient-to-r from-pink-500 to-violet-600 bg-clip-text text-transparent">
                    Discover Premium
                </h1>
                <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-6">
                    Elevate your lifestyle with our curated collection of exclusive cosmetics and beauty products.
                </p>

                {/* Proceed to Checkout Button for convenience */}
                {items.length > 0 && (
                    <button
                        onClick={handleQuickCheckout}
                        className="bg-black text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-gray-800 transition-transform hover:scale-105 flex items-center mx-auto space-x-2"
                    >
                        <CreditCard className="w-5 h-5" />
                        <span>Proceed to Checkout ({items.length} items)</span>
                    </button>
                )}
            </section>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                    <div key={product.id} className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                        <Link to={`/products/${product.id}`}>
                            <div className="aspect-square bg-gray-100 overflow-hidden relative">
                                <img
                                    src={product.image_url || `https://placehold.co/400?text=${product.name}`}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            </div>
                        </Link>
                        <div className="p-6">
                            <Link to={`/products/${product.id}`}>
                                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-pink-500 transition-colors">{product.name}</h3>
                            </Link>
                            <div className="flex items-center justify-between mt-4">
                                <span className="text-xl font-bold">¥{product.price.toLocaleString()}</span>
                                <button
                                    onClick={() => addToCart({ id: product.id, name: product.name, price: product.price, image_url: product.image_url, quantity: 1 })}
                                    className="p-3 bg-black text-white rounded-full hover:bg-pink-500 transition-colors shadow-lg"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;
