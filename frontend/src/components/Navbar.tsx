import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart, LogOut, User as UserIcon } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const { items } = useCart();
    const navigate = useNavigate();
    const location = useLocation();
    const [showProfile, setShowProfile] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAuthPage = ['/login', '/register', '/admin'].some(path => location.pathname.startsWith(path));

    if (location.pathname.startsWith('/admin')) return null; // Let AdminDashboard handle its own layout

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to={user && !user.is_admin ? `/home/${user.id}` : "/"} className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent transform hover:scale-105 transition-transform">
                    Lumière
                </Link>

                {/* Cart Icon: Hide on Auth pages or if Admin */}
                {!isAuthPage && !user?.is_admin && (
                    <div className="flex items-center space-x-6">
                        <Link to="/cart" className="relative group p-2 rounded-full hover:bg-gray-100 transition-colors">
                            <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-pink-500 transition-colors" />
                            {items.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full animate-pulse">
                                    {items.length}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <div className="flex items-center space-x-4 relative">
                                <button
                                    onClick={() => setShowProfile(!showProfile)}
                                    className="flex items-center space-x-2 text-gray-700 hover:text-pink-500 transition-colors focus:outline-none"
                                >
                                    <UserIcon className="w-5 h-5" />
                                    <span className="hidden sm:block">{user.email}</span>
                                </button>

                                {showProfile && (
                                    <div className="absolute top-10 right-0 w-72 bg-white rounded-xl shadow-xl border border-gray-100 p-6 z-50 animate-in fade-in slide-in-from-top-2">
                                        <h3 className="font-bold text-lg mb-4 text-gray-800">Account Info</h3>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                                                <p className="text-sm font-medium">{user.email}</p>
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 uppercase font-semibold">Password</label>
                                                <p className="text-sm font-mono text-gray-400">********</p>
                                            </div>
                                            <div className="pt-2 border-t">
                                                <p className="text-xs text-gray-400">User ID: {user.id}</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-red-500 transition-colors" title="Logout">
                                    <LogOut className="w-5 h-5" />
                                </button>
                            </div>
                        ) : null}
                    </div>
                )}

                {/* Login/Signup Links: Show if NOT logged in (even on /login or /register page, to allow switching) */}
                {!user && (
                    <div className="flex items-center space-x-4 ml-6">
                        {/* Only hide Login link if on Login page, etc? Or just show them. User requested them to be visible. */}
                        <Link to="/login" className={`text-gray-600 hover:text-gray-900 font-medium transition-colors ${location.pathname === '/login' ? 'hidden' : ''}`}>Login</Link>
                        <Link to="/register" className={`px-4 py-2 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition-transform hover:scale-105 shadow-lg hover:shadow-xl ${location.pathname === '/register' ? 'hidden' : ''}`}>
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
