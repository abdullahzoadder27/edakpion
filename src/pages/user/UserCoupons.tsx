import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Ticket, Copy, CheckCircle2 } from 'lucide-react';
import { Coupon } from '../../types';

export default function UserCoupons() {
  const { profile } = useOutletContext<any>();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const { data, error } = await supabase
          .from('coupons')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setCoupons(data || []);
      } catch (err) {
        // console.warn('Error fetching coupons:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoupons();
  }, []);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif text-[#0F3D2E]">My Coupons</h1>
        <p className="text-gray-500 text-sm">Available discounts and offers for your next purchase.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-[#E8E4DE]">Loading coupons...</div>
        ) : coupons.length === 0 ? (
          <div className="col-span-full py-16 text-center text-gray-500 bg-white rounded-2xl border border-[#E8E4DE]">
            <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium text-[#0F3D2E]">No active coupons available right now.</p>
          </div>
        ) : (
          coupons.map(coupon => (
            <div key={coupon.id} className="bg-white rounded-2xl border border-[#E8E4DE] overflow-hidden flex flex-col sm:flex-row relative">
              <div className="bg-[#0F3D2E] text-white p-6 flex flex-col justify-center items-center text-center sm:w-1/3 relative border-b sm:border-b-0 sm:border-r border-dashed border-white/50">
                <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#F5F2ED] rounded-full hidden sm:block"></div>
                <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full hidden sm:block"></div>
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-[#F5F2ED] rounded-full sm:hidden"></div>
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white rounded-full sm:hidden"></div>
                
                <span className="text-3xl font-serif font-bold">
                  {coupon.type === 'percentage' ? `${coupon.value}%` : `৳${coupon.value}`}
                </span>
                <span className="text-sm font-medium opacity-80 uppercase tracking-widest mt-1">OFF</span>
              </div>
              
              <div className="p-6 flex-1 flex flex-col justify-between relative">
                <div>
                  <h3 className="font-serif text-[#0F3D2E] text-lg mb-2">Special Discount</h3>
                  {coupon.end_date && (
                    <p className="text-xs text-gray-500 mb-4">Valid until: {new Date(coupon.end_date).toLocaleDateString()}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between gap-4 p-3 bg-[#F5F2ED] rounded-xl border border-dashed border-[#0F3D2E]/20">
                  <span className="font-mono font-bold text-[#0F3D2E] tracking-wider text-sm">{coupon.code}</span>
                  <button 
                    onClick={() => copyToClipboard(coupon.code)}
                    className="text-[#0F3D2E] hover:scale-110 transition-transform"
                    title="Copy code"
                  >
                    {copiedCode === coupon.code ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
