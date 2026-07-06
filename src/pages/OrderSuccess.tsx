import { Link, useParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams<{ id: string }>();
  
  return (
    <div className="bg-[#F5F2ED] min-h-[70vh] flex flex-col items-center justify-center p-6">
      <div className="bg-white p-6 rounded-full mb-6 text-[#0F3D2E] border border-[#E8E4DE]">
        <CheckCircle className="w-16 h-16" />
      </div>
      <h1 className="text-3xl font-serif mb-4 text-center text-[#0F3D2E]">ORDER PLACED SUCCESSFULLY!</h1>
      <p className="text-gray-600 mb-2 text-center max-w-md font-light">Thank you for your purchase. We've received your order and are getting it ready to be shipped.</p>
      
      {id && (
        <div className="bg-white px-8 py-4 rounded-3xl border border-[#E8E4DE] mt-4 mb-8 shadow-sm">
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Order #</p>
          <p className="font-mono font-bold text-lg text-[#0F3D2E]">{id}</p>
        </div>
      )}
      
      <Link to="/shop" className="bg-[#0F3D2E] text-white px-8 py-3 rounded-full font-bold text-xs tracking-widest uppercase hover:bg-[#154636] transition-colors">
        CONTINUE SHOPPING
      </Link>
    </div>
  );
}

