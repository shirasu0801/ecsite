import { useEffect, useState } from 'react';
import api from '../api';
import { Package, Users, Plus, LayoutGrid, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Order {
    id: number;
    total_amount: number;
    status: string;
    created_at: string;
    user_id: number;
}

interface User {
    id: number;
    email: string;
}

interface Product {
    id: number;
    name: string;
    price: number;
    stock: number;
}

const AdminDashboard = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'add_product'>('products');
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Product Form State
    const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '', description: '', image_url: '' });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Using 'api' instance which already has interceptor for 'Authorization: Bearer token'
                // If token is in localStorage, it should work. 
                // Double checking endpoints.
                if (activeTab === 'orders') {
                    const ordersRes = await api.get('/admin/orders');
                    setOrders(ordersRes.data);
                } else if (activeTab === 'users') {
                    const usersRes = await api.get('/admin/users');
                    setUsers(usersRes.data);
                } else if (activeTab === 'products') {
                    const productsRes = await api.get('/products/');
                    setProducts(productsRes.data);
                }
            } catch (err) {
                console.error("Admin Fetch Error:", err);
                // Force logout if 401?
            }
        };
        fetchData();
    }, [activeTab]);

    const handleCreateProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/products/', {
                ...newProduct,
                price: parseFloat(newProduct.price),
                stock: parseInt(newProduct.stock)
            });
            alert("Product Created!");
            setNewProduct({ name: '', price: '', stock: '', description: '', image_url: '' });
            setActiveTab('products');
        } catch (err) {
            alert("Failed to create product");
        }
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    }

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col fixed h-full">
                <div className="p-6 border-b border-slate-800">
                    <h2 className="text-2xl font-bold">Admin Panel</h2>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'products' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <LayoutGrid className="w-5 h-5 mr-3" /> Products & Stock
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'orders' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Package className="w-5 h-5 mr-3" /> Orders
                    </button>
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Users className="w-5 h-5 mr-3" /> Users
                    </button>
                    <button
                        onClick={() => setActiveTab('add_product')}
                        className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${activeTab === 'add_product' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                        <Plus className="w-5 h-5 mr-3" /> Add Product
                    </button>
                </nav>
                <div className="p-4 border-t border-slate-800">
                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-400 hover:bg-slate-800 rounded-lg transition-colors">
                        <LogOut className="w-5 h-5 mr-3" /> Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold capitalize">{activeTab.replace('_', ' ')}</h1>
                </header>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {activeTab === 'products' && (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600">ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Price</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Stock</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map(p => (
                                    <tr key={p.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500">#{p.id}</td>
                                        <td className="px-6 py-4 font-medium">{p.name}</td>
                                        <td className="px-6 py-4">¥{p.price.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {p.stock} units
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'orders' && (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Order ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">User ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Amount</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500">#{order.id}</td>
                                        <td className="px-6 py-4 font-mono">{order.user_id}</td>
                                        <td className="px-6 py-4 font-bold">¥{order.total_amount.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'users' && (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 font-semibold text-gray-600">User ID</th>
                                    <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-gray-500">#{u.id}</td>
                                        <td className="px-6 py-4">{u.email}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'add_product' && (
                        <div className="p-8">
                            <form onSubmit={handleCreateProduct} className="max-w-2xl space-y-6">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Product Name</label>
                                    <input className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-pink-500 outline-none" value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} required />
                                </div>
                                <div className="flex space-x-6">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Price (¥)</label>
                                        <input className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-pink-500 outline-none" type="number" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} required />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium mb-1">Stock</label>
                                        <input className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-pink-500 outline-none" type="number" value={newProduct.stock} onChange={e => setNewProduct({ ...newProduct, stock: e.target.value })} required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Image URL</label>
                                    <input className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-pink-500 outline-none" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-pink-500 outline-none h-32" value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} required />
                                </div>
                                <button className="bg-pink-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-pink-700 transition-colors">Create Product</button>
                            </form>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
