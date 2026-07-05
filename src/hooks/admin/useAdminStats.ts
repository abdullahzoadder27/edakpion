import { useState, useEffect } from 'react';
import { supabase, isMockData } from '../../lib/supabase';

export interface AdminStats {
  totalSales: number;
  todaySales: number;
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalUsers: number;
  totalSubscribers: number;
  totalReviews: number;
  supportTickets: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (isMockData) {
          // Return mock admin stats
          setStats({
            totalSales: 15420.50,
            todaySales: 345.00,
            totalOrders: 142,
            pendingOrders: 12,
            processingOrders: 8,
            shippedOrders: 25,
            deliveredOrders: 90,
            cancelledOrders: 7,
            totalProducts: 45,
            lowStockProducts: 4,
            totalUsers: 840,
            totalSubscribers: 1250,
            totalReviews: 320,
            supportTickets: 3,
          });
          setIsLoading(false);
          return;
        }
        
        // Orders & Sales
        const { data: orders, error: ordersError } = await supabase
          .from('orders')
          .select('id, total, status, created_at');
          
        if (ordersError) throw ordersError;

        let totalSales = 0;
        let todaySales = 0;
        let pending = 0, processing = 0, shipped = 0, delivered = 0, cancelled = 0;
        
        const today = new Date();
        today.setHours(0,0,0,0);

        orders?.forEach(order => {
          if (order.status !== 'cancelled') {
            totalSales += Number(order.total);
            const orderDate = new Date(order.created_at);
            if (orderDate >= today) {
              todaySales += Number(order.total);
            }
          }
          
          if (order.status === 'pending') pending++;
          else if (order.status === 'processing') processing++;
          else if (order.status === 'shipped') shipped++;
          else if (order.status === 'delivered') delivered++;
          else if (order.status === 'cancelled') cancelled++;
        });

        // Products
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('id, stock');
        if (productsError) throw productsError;
        
        let lowStock = 0;
        products?.forEach(p => {
          if (p.stock <= 5) lowStock++;
        });

        // Users
        const { count: usersCount } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'user');
        
        // Subscribers
        const { count: subsCount } = await supabase.from('subscribers').select('id', { count: 'exact', head: true });
        
        // Reviews
        const { count: reviewsCount } = await supabase.from('reviews').select('id', { count: 'exact', head: true });
        
        // Support Tickets
        const { count: ticketsCount } = await supabase.from('support_tickets').select('id', { count: 'exact', head: true });

        setStats({
          totalSales,
          todaySales,
          totalOrders: orders?.length || 0,
          pendingOrders: pending,
          processingOrders: processing,
          shippedOrders: shipped,
          deliveredOrders: delivered,
          cancelledOrders: cancelled,
          totalProducts: products?.length || 0,
          lowStockProducts: lowStock,
          totalUsers: usersCount || 0,
          totalSubscribers: subsCount || 0,
          totalReviews: reviewsCount || 0,
          supportTickets: ticketsCount || 0,
        });

      } catch (err: any) {
        // console.error('Error fetching admin stats:', err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, isLoading, error };
}
