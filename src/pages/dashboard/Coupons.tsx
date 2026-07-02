import React, { useState, useEffect } from 'react';
import { UserDashboardLayout } from '../../components/dashboard/UserDashboardLayout';
import { Ticket, Copy, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Coupon {
  id: string;
  code: string;
  title: string;
  description: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_purchase: number;
  status: 'valid' | 'used' | 'expired';
  expires_at: string | null;
}

export function Coupons() {
  const { user } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCoupons() {
      if (!user || !supabase) {
        setLoading(false);
        return;
      }

      const mockCoupons: Coupon[] = [
        {
          id: '1',
          code: 'WELCOME20',
          title: '20% OFF',
          description: 'Welcome discount for new customers.',
          discount_type: 'percent',
          discount_value: 20,
          min_purchase: 2000,
          status: 'valid',
          expires_at: new Date(Date.now() + 86400000 * 7).toISOString(),
        },
        {
          id: '2',
          code: 'FREESHIP',
          title: 'Free Shipping',
          description: 'Valid on all oversized t-shirts.',
          discount_type: 'fixed',
          discount_value: 120,
          min_purchase: 5000,
          status: 'expired',
          expires_at: new Date(Date.now() - 86400000).toISOString(),
        }
      ];

      try {
        // Try to fetch from a coupons table (assuming it might exist or be created)
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          // .eq('user_id', user.id) // Optionally filter by user if specific to user
          .order('status', { ascending: true }); // 'valid' < 'used' < 'expired'

        if (error) throw error;
        setCoupons(data && data.length > 0 ? data : mockCoupons);
      } catch (err) {
        console.error('Error fetching coupons:', err);
        setCoupons(mockCoupons);
      } finally {
        setLoading(false);
      }
    }

    fetchCoupons();
  }, [user]);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <UserDashboardLayout>
      <div className="bg-white rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-gray-100 overflow-hidden min-h-[60vh]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Coupons</h1>
            <p className="text-sm text-gray-500 mt-1">Available discounts and promotional offers.</p>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--color-brand-dark)]" /></div>
        ) : coupons.length === 0 ? (
           <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Coupons Available</h3>
            <p className="text-gray-500 text-sm">Check back later for exciting offers and discounts.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coupons.map((coupon) => (
                <div key={coupon.id} className={`relative border border-gray-200 rounded-2xl p-6 overflow-hidden flex flex-col justify-between min-h-[160px] shadow-sm ${coupon.status === 'valid' ? 'bg-white' : 'bg-gray-50 opacity-70'}`}>
                  <div className={`absolute top-0 left-0 w-2 h-full ${coupon.status === 'valid' ? 'bg-gray-900' : 'bg-gray-300'}`}></div>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded mb-2 ${
                        coupon.status === 'valid' ? 'bg-green-100 text-green-700' :
                        coupon.status === 'used' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {coupon.status}
                      </span>
                      <h3 className={`text-2xl font-bold ${coupon.status === 'valid' ? 'text-gray-900' : 'text-gray-500'}`}>{coupon.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">Min. purchase: ৳ {coupon.min_purchase.toLocaleString()}</p>
                    </div>
                    <Ticket className="w-8 h-8 text-gray-200" />
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-dashed border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Code</p>
                      <p className={`font-mono font-bold text-lg ${coupon.status === 'valid' ? 'text-gray-900' : 'text-gray-500 line-through'}`}>{coupon.code}</p>
                    </div>
                    {coupon.status === 'valid' ? (
                      <button 
                        onClick={() => copyToClipboard(coupon.code)}
                        className="flex items-center gap-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold uppercase tracking-widest text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        {copied === coupon.code ? <><CheckCircle2 className="w-4 h-4 text-green-500" /> Copied</> : <><Copy className="w-4 h-4" /> Copy</>}
                      </button>
                    ) : (
                       <span className="text-xs font-bold text-gray-400 uppercase">{coupon.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </UserDashboardLayout>
  );
}
