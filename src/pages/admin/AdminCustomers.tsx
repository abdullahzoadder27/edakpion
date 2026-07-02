import React, { useState, useEffect } from 'react';
import { Search, Loader2, Users, Mail, Phone, Calendar } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export function AdminCustomers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      try {
        setLoading(true);
        if (!isSupabaseConfigured || !supabase) return;
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*, orders(count)')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        setCustomers(profiles || []);
      } catch (err) {
        console.error('Error fetching customers', err);
      } finally {
        setLoading(false);
      }
    }
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(c => 
    c.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.id?.includes(search)
  );

  return (
    <div className="p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your customer base</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[var(--color-brand-dark)] outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-20 text-gray-500">
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No customers found</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-6 font-medium">Customer</th>
                  <th className="p-6 font-medium">Contact</th>
                  <th className="p-6 font-medium">Joined</th>
                  <th className="p-6 font-medium text-right">Orders</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 overflow-hidden shrink-0">
                          {customer.avatar_url ? (
                            <img src={customer.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-gray-400">
                              {(customer.full_name || customer.id).charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{customer.full_name || 'Anonymous User'}</p>
                          <p className="text-[10px] text-gray-500 mt-1 uppercase font-mono tracking-wider">{customer.id.substring(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="space-y-1">
                         <div className="flex items-center gap-2 text-gray-500">
                           <Phone className="w-3.5 h-3.5" />
                           <span>{customer.phone || 'N/A'}</span>
                         </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-6 text-right font-bold text-gray-900">
                      {customer.orders?.[0]?.count || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
