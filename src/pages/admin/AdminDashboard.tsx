import { useAdminStats } from '../../hooks/admin/useAdminStats';
import { formatPrice } from '../../lib/utils';
import { 
  DollarSign, ShoppingBag, Package, Users, Mail, Star, HelpCircle, AlertTriangle 
} from 'lucide-react';

export default function AdminDashboard() {
  const { stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <h1 className="text-2xl font-bold text-[#0F3D2E]">Dashboard Overview</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-[#E8E4DE] h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 text-red-500 p-6 rounded-xl border border-red-100">
        Error loading dashboard stats. Please try again.
      </div>
    );
  }

  const statCards = [
    { title: 'Total Sales', value: formatPrice(stats.totalSales), icon: <DollarSign className="w-6 h-6 text-green-600" />, bg: 'bg-green-50' },
    { title: 'Today\'s Sales', value: formatPrice(stats.todaySales), icon: <DollarSign className="w-6 h-6 text-blue-600" />, bg: 'bg-blue-50' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <ShoppingBag className="w-6 h-6 text-indigo-600" />, bg: 'bg-indigo-50' },
    { title: 'Pending Orders', value: stats.pendingOrders, icon: <ShoppingBag className="w-6 h-6 text-yellow-600" />, bg: 'bg-yellow-50' },
    { title: 'Total Products', value: stats.totalProducts, icon: <Package className="w-6 h-6 text-purple-600" />, bg: 'bg-purple-50' },
    { title: 'Low Stock', value: stats.lowStockProducts, icon: <AlertTriangle className="w-6 h-6 text-red-600" />, bg: 'bg-red-50' },
    { title: 'Total Users', value: stats.totalUsers, icon: <Users className="w-6 h-6 text-teal-600" />, bg: 'bg-teal-50' },
    { title: 'Support Tickets', value: stats.supportTickets, icon: <HelpCircle className="w-6 h-6 text-orange-600" />, bg: 'bg-orange-50' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#0F3D2E] tracking-tight">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <div key={idx} className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
              <h3 className="text-2xl font-bold text-[#0F3D2E]">{card.value}</h3>
            </div>
            <div className={`p-3 rounded-xl ${card.bg}`}>
              {card.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status Breakdown */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
          <h3 className="text-lg font-bold text-[#0F3D2E] mb-6">Orders by Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Pending</span>
              <span className="font-bold">{stats.pendingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> Processing</span>
              <span className="font-bold">{stats.processingOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Shipped</span>
              <span className="font-bold">{stats.shippedOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Delivered</span>
              <span className="font-bold">{stats.deliveredOrders}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Cancelled</span>
              <span className="font-bold">{stats.cancelledOrders}</span>
            </div>
          </div>
        </div>

        {/* Engagement Stats */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
          <h3 className="text-lg font-bold text-[#0F3D2E] mb-6">Engagement Overview</h3>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-50">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Newsletter Subscribers</p>
                <p className="text-xl font-bold text-[#0F3D2E]">{stats.totalSubscribers}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-50">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Product Reviews</p>
                <p className="text-xl font-bold text-[#0F3D2E]">{stats.totalReviews}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

