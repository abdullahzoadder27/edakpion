import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ShieldCheck, LayoutDashboard, Settings, Users, ShoppingCart, Box, LogOut, Image, Layout, Tag, Truck, Bell, MessageSquare } from 'lucide-react';
import { Link, Outlet, useNavigate } from 'react-router-dom';

export function AdminLayout() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/edakpion-control-panel');
  };

  const navItems = [
    { name: 'Dashboard', path: '/edakpion-control-panel/dashboard', icon: LayoutDashboard },
    { name: 'Orders', path: '/edakpion-control-panel/orders', icon: ShoppingCart },
    { name: 'Products', path: '/edakpion-control-panel/products', icon: Box },
    { name: 'Support Center', path: '/edakpion-control-panel/support', icon: MessageSquare },
    { name: 'Media Library', path: '/edakpion-control-panel/media', icon: Image },
    { name: 'Homepage CMS', path: '/edakpion-control-panel/cms', icon: Layout },
    { name: 'Customers', path: '/edakpion-control-panel/customers', icon: Users },
    { name: 'Coupons', path: '/edakpion-control-panel/coupons', icon: Tag },
    { name: 'Delivery', path: '/edakpion-control-panel/delivery', icon: Truck },
    { name: 'Notifications', path: '/edakpion-control-panel/notifications', icon: Bell },
    { name: 'Settings', path: '/edakpion-control-panel/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col hidden md:flex shrink-0">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-[var(--color-brand-cream)]" />
          <div>
            <h2 className="font-bold tracking-widest uppercase text-sm">EDAKPION</h2>
            <p className="text-gray-400 text-xs">Control Panel</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors text-sm font-medium"
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-red-400 hover:bg-gray-800 w-full rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6 shrink-0 md:hidden">
           <div className="flex items-center gap-2">
             <ShieldCheck className="w-6 h-6 text-gray-900" />
             <span className="font-bold tracking-widest uppercase text-sm">Control Panel</span>
           </div>
           <button onClick={handleLogout} className="text-gray-500 hover:text-red-500">
             <LogOut className="w-5 h-5" />
           </button>
        </header>
        
        <main className="flex-1 p-6 lg:p-10 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">System Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Sales', value: '৳ 24,500', trend: '+12%', positive: true },
          { label: 'Active Orders', value: '34', trend: '+5%', positive: true },
          { label: 'Total Customers', value: '1,240', trend: '+18%', positive: true },
          { label: 'Low Stock Items', value: '12', trend: '-2', positive: false },
        ].map((stat, i) => (
          <div key={i} className="premium-card p-6">
            <p className="text-sm font-medium text-gray-500 mb-2">{stat.label}</p>
            <div className="flex items-end justify-between">
              <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
              <span className={`text-sm font-medium ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="premium-card p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Audit Logs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50/50 text-gray-500 uppercase text-xs">
              <tr>
                <th className="py-3 px-4 rounded-tl-xl border-b border-gray-100">Timestamp</th>
                <th className="py-3 px-4 border-b border-gray-100">Action</th>
                <th className="py-3 px-4 border-b border-gray-100">Entity</th>
                <th className="py-3 px-4 rounded-tr-xl border-b border-gray-100">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-gray-500">Just now</td>
                <td className="py-3 px-4 font-medium text-gray-900">Admin Login</td>
                <td className="py-3 px-4 text-gray-600">Auth System</td>
                <td className="py-3 px-4 text-gray-400 font-mono text-xs">192.168.1.1</td>
              </tr>
              <tr className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3 px-4 text-gray-500">2 hours ago</td>
                <td className="py-3 px-4 font-medium text-gray-900">Update Product</td>
                <td className="py-3 px-4 text-gray-600">Premium Oversized T-Shirt</td>
                <td className="py-3 px-4 text-gray-400 font-mono text-xs">192.168.1.1</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center h-64 premium-card border-dashed">
      <div className="text-center">
        <h2 className="text-xl font-bold text-gray-400 mb-2">{title} Module</h2>
        <p className="text-sm text-gray-400">This module is under development.</p>
      </div>
    </div>
  );
}
