import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user, isLoading } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (!isLoading && user) {
            const redirectPath = user.is_admin ? '/admin' : `/home/${user.id}`;
            // Avoid loop if we are somehow already attempting to navigate or if history state is weird? 
            // Standard replace is good.
            navigate(redirectPath, { replace: true });
        }
    }, [user, isLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            const res = await api.post('/login', formData);
            await login(res.data.access_token);

            // Check if admin after login (Need to wait for user state update, but we can decode or just fetch)
            // Since login() fetches user, we can check a separate api call or just rely on manual navigation for now,
            // but to be safe, let's fetch strictly.
            try {
                const userRes = await api.get('/users/me', { headers: { Authorization: `Bearer ${res.data.access_token}` } });
                if (userRes.data.is_admin) {
                    navigate('/admin');
                } else {
                    navigate(`/home/${userRes.data.id}`);
                }
            } catch (e) {
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[60vh]">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">Welcome Back</h2>
                {error && <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-4 text-center text-sm">{error}</div>}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                            placeholder="you@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-transform active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
