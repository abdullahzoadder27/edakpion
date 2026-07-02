import { Leaf, Truck, RefreshCcw } from 'lucide-react';

export function Features() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--color-brand-card)] p-6 flex items-center gap-5 premium-card premium-hover">
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm">
             <Leaf className="w-6 h-6 text-[#244b36]" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-gray-900">PREMIUM QUALITY</h3>
            <p className="text-xs text-gray-600 mt-1">Finest Fabric</p>
          </div>
        </div>
        <div className="bg-[var(--color-brand-card)] p-6 flex items-center gap-5 premium-card premium-hover">
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm">
             <Truck className="w-6 h-6 text-[#244b36]" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-gray-900">FAST DELIVERY</h3>
            <p className="text-xs text-gray-600 mt-1">Across Bangladesh</p>
          </div>
        </div>
        <div className="bg-[var(--color-brand-card)] p-6 flex items-center gap-5 premium-card premium-hover">
          <div className="w-12 h-12 flex items-center justify-center bg-white rounded-xl shadow-sm">
             <RefreshCcw className="w-6 h-6 text-[#244b36]" />
          </div>
          <div>
            <h3 className="font-bold text-sm tracking-wide text-gray-900">EASY RETURNS</h3>
            <p className="text-xs text-gray-600 mt-1">7 Days Return</p>
          </div>
        </div>
      </div>
    </div>
  );
}
