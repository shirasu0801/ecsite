import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { ShoppingCart, ArrowLeft } from 'lucide-react';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
}

const ProductDetail = () => {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${id}`);
                setProduct(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    if (loading) return <div className="text-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    const handleAddToCart = () => {
        addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            quantity
        });
        // Optional: Show toast
    };

    return (
        <div className="max-w-6xl mx-auto">
            <button onClick={() => navigate(-1)} className="flex items-center text-gray-500 hover:text-black mb-8 transition-colors">
                <ArrowLeft className="w-5 h-5 mr-2" /> Back
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                    <img
                        src={product.image_url || `https://placehold.co/600?text=${product.name}`}
                        alt={product.name}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div className="flex flex-col justify-center">
                    <h1 className="text-4xl font-extrabold mb-4">{product.name}</h1>
                    <p className="text-3xl font-bold text-pink-500 mb-6">¥{product.price.toLocaleString()}</p>
                    <p className="text-gray-600 mb-8 leading-relaxed text-lg">
                        {product.description || "No description available."}
                    </p>

                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-4 mb-6">
                            <span className="font-medium">Quantity:</span>
                            <div className="flex items-center border rounded-lg">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-50">-</button>
                                <span className="px-4 py-2 font-bold">{quantity}</span>
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 hover:bg-gray-50">+</button>
                            </div>
                            <span className="text-sm text-gray-500 ml-4">{product.stock} available</span>
                        </div>

                        <button
                            onClick={handleAddToCart}
                            disabled={product.stock === 0}
                            className="w-full bg-black text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-transform active:scale-95 disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            <span>{product.stock > 0 ? "Add to Cart" : "Out of Stock"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
