import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import { formatPrice, formatDate } from '../../lib/utils';
import { ArrowLeft, Package, Trash2, Edit2, Check, X as XIcon, Plus, Save } from 'lucide-react';

export default function OrderDetailAdmin() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [deleting, setDeleting] = useState(false);

  // Edit State
  const [editForm, setEditForm] = useState<any>({});
  const [editItems, setEditItems] = useState<any[]>([]);

  useEffect(() => {
    fetchOrder();
    fetchProducts();
  }, [id]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('id, name, price, stock, images');
    if (data) setProducts(data);
  };

  const fetchOrder = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_id,
            quantity,
            price,
            product_name,
            selected_size,
            selected_color,
            products (
              images
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setOrder(data);
      initEditState(data);
    } catch (err) {
      console.warn('Error fetching order:', err);
    } finally {
      setLoading(false);
    }
  };

  const initEditState = (data: any) => {
    setEditForm({
      customer_name: data.customer_name || '',
      phone: data.phone || '',
      email: data.email || '',
      address: data.address || '',
      district: data.district || '',
      division: data.division || '',
      delivery_charge: data.delivery_charge || 0,
      discount: data.discount || 0,
      payment_method: data.payment_method || 'cod',
      payment_status: data.payment_status || 'unpaid',
      status: data.status || 'pending',
      tracking_number: data.tracking_number || '',
      notes: data.notes || '',
      admin_notes: data.admin_notes || ''
    });
    setEditItems(data.order_items || []);
  };

  useEffect(() => {
    if (isEditing) {
      recalculateTotals();
    }
  }, [editItems, editForm.delivery_charge, editForm.discount]);

  const recalculateTotals = () => {
    const newSubtotal = editItems.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    const newTotal = newSubtotal + Number(editForm.delivery_charge) - Number(editForm.discount);
    
    setEditForm((prev: any) => ({
      ...prev,
      subtotal: newSubtotal,
      total: newTotal > 0 ? newTotal : 0
    }));
  };

  const handleStatusChange = async (newStatus: string) => {
    if (isEditing) {
      setEditForm({ ...editForm, status: newStatus });
      return;
    }
    try {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      setOrder({ ...order, status: newStatus });
    } catch (err) {
      console.warn('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...editItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEditItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = editItems.filter((_, i) => i !== index);
    setEditItems(newItems);
  };

  const handleAddItem = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value;
    if (!productId) return;
    
    const product = products.find(p => p.id === productId);
    if (product) {
      setEditItems([
        ...editItems,
        {
          id: crypto.randomUUID(), // Temp ID for new items
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
          selected_size: '',
          selected_color: '',
          isNew: true,
          products: { images: product.images }
        }
      ]);
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. Update Order record (ignore missing columns like admin_notes, tracking_number for now to avoid crashes if migration didn't run, 
      // but let's try to include them. If they fail, we can fallback, but let's just include what we know exists + new ones).
      const orderUpdate: any = {
        customer_name: editForm.customer_name,
        phone: editForm.phone,
        email: editForm.email,
        address: editForm.address,
        district: editForm.district,
        division: editForm.division,
        delivery_charge: editForm.delivery_charge,
        discount: editForm.discount,
        subtotal: editForm.subtotal || 0,
        total: editForm.total || 0,
        payment_method: editForm.payment_method,
        payment_status: editForm.payment_status,
        status: editForm.status,
        notes: editForm.notes,
      };

      if (order && 'tracking_number' in order) {
        orderUpdate.tracking_number = editForm.tracking_number;
      }
      if (order && 'admin_notes' in order) {
        orderUpdate.admin_notes = editForm.admin_notes;
      }

      const { error: orderError } = await supabase.from('orders').update(orderUpdate).eq('id', id);
      
      if (orderError) {
        console.error("Update error:", orderError);
        throw orderError;
      }

      // 2. Handle Order Items and Stock Update
      // Calculate stock diffs: oldItems vs editItems
      const oldItems = order.order_items || [];
      
      // We process each product ID involved to compute net quantity change
      const productQtyDiff: Record<string, number> = {};
      
      // Add back old items quantities
      oldItems.forEach((old: any) => {
        if (old.product_id) {
          productQtyDiff[old.product_id] = (productQtyDiff[old.product_id] || 0) - old.quantity;
        }
      });
      
      // Deduct new items quantities
      editItems.forEach((newItem: any) => {
        if (newItem.product_id) {
          productQtyDiff[newItem.product_id] = (productQtyDiff[newItem.product_id] || 0) + Number(newItem.quantity);
        }
      });

      // Update product stocks based on diffs
      for (const [productId, diff] of Object.entries(productQtyDiff)) {
        if (diff !== 0) {
          // If diff > 0, we ordered more, so stock decreases. If diff < 0, we ordered less, stock increases.
          // Wait, stock = current - diff
          const { data: p } = await supabase.from('products').select('stock').eq('id', productId).single();
          if (p) {
            await supabase.from('products').update({ stock: p.stock - diff }).eq('id', productId);
          }
        }
      }

      // Delete existing
      await supabase.from('order_items').delete().eq('order_id', id);
      
      // Insert new
      const itemsToInsert = editItems.map((item: any) => ({
        order_id: id,
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: Number(item.quantity),
        selected_size: item.selected_size,
        selected_color: item.selected_color,
      }));

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase.from('order_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }

      setIsEditing(false);
      await fetchOrder();
      
      // Log Activity
      if (user) {
        await supabase.from('admin_activity_logs').insert({
          admin_id: user.id,
          action: 'updated',
          entity_type: 'order',
          entity_id: id,
          metadata: { notes: 'Updated order details and items' }
        });
      }
      alert('Order updated successfully!');
    } catch (err: any) {
      console.error('Error saving order:', err);
      alert('Failed to save order: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) return;
    
    setDeleting(true);
    try {
      // Restore stock manually first just in case trigger doesn't exist
      if (order.status !== 'cancelled') {
        for (const item of order.order_items || []) {
          if (item.product_id) {
            // we fetch current stock to add
            const { data: p } = await supabase.from('products').select('stock').eq('id', item.product_id).single();
            if (p) {
              await supabase.from('products').update({ stock: p.stock + item.quantity }).eq('id', item.product_id);
            }
          }
        }
      }

      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
      
      
      // Log Activity
      if (user) {
        await supabase.from('admin_activity_logs').insert({
          admin_id: user.id,
          action: 'deleted',
          entity_type: 'order',
          entity_id: id,
          metadata: { notes: 'Deleted order' }
        });
      }
      alert('Order deleted successfully!');
      navigate('/admin/orders');
    } catch (err: any) {
      console.error('Error deleting order:', err);
      alert('Failed to delete order: ' + err.message);
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/orders" className="p-2 text-gray-500 hover:bg-white rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-[#0F3D2E]">Order Details</h1>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <>
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E4DE] text-[#0F3D2E] rounded-lg font-bold hover:bg-gray-50"
              >
                <Edit2 className="w-4 h-4" /> Edit Order
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold hover:bg-red-100 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" /> {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => { setIsEditing(false); initEditState(order); }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E8E4DE] text-gray-600 rounded-lg font-bold hover:bg-gray-50"
              >
                <XIcon className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-[#0F3D2E] text-white rounded-lg font-bold hover:bg-[#154636] disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-mono font-bold text-[#0F3D2E]">{order.id}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-bold text-[#0F3D2E]">{formatDate(order.created_at)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 py-4 border-y border-[#E8E4DE]">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Order Status</label>
                <select 
                  value={isEditing ? editForm.status : order.status}
                  onChange={(e) => isEditing ? setEditForm({...editForm, status: e.target.value}) : handleStatusChange(e.target.value)}
                  disabled={!isEditing && false} // always allow changing status quickly if not editing? The requirement said admin can edit any order. We can leave it enabled for quick change, but let's bind it correctly.
                  className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-bold"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Status</label>
                <select 
                  value={isEditing ? editForm.payment_status : order.payment_status}
                  onChange={(e) => setEditForm({...editForm, payment_status: e.target.value})}
                  disabled={!isEditing}
                  className="w-full px-4 py-2 bg-gray-50 border border-[#E8E4DE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F3D2E]/20 font-bold"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-[#0F3D2E]">Order Items</h3>
                {isEditing && (
                  <select 
                    onChange={handleAddItem}
                    className="px-3 py-1.5 bg-gray-50 border border-[#E8E4DE] rounded-lg text-sm outline-none"
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add Product</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} - {formatPrice(p.price)}</option>
                    ))}
                  </select>
                )}
              </div>

              <div className="divide-y divide-[#E8E4DE]">
                {(isEditing ? editItems : order.order_items)?.map((item: any, index: number) => (
                  <div key={item.id || index} className="py-4 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                      {item.products?.images?.[0] ? (
                        <img loading="lazy" decoding="async" src={item.products.images[0]} alt={item.product_name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <p className="font-bold text-[#0F3D2E]">{item.product_name}</p>
                      
                      {isEditing ? (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          <input 
                            type="number" 
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            className="px-2 py-1 bg-gray-50 border border-[#E8E4DE] rounded text-sm w-full"
                            placeholder="Qty"
                          />
                          <input 
                            type="number" 
                            value={item.price}
                            onChange={(e) => handleItemChange(index, 'price', Number(e.target.value))}
                            className="px-2 py-1 bg-gray-50 border border-[#E8E4DE] rounded text-sm w-full"
                            placeholder="Price"
                          />
                          <input 
                            type="text" 
                            value={item.selected_size || ''}
                            onChange={(e) => handleItemChange(index, 'selected_size', e.target.value)}
                            className="px-2 py-1 bg-gray-50 border border-[#E8E4DE] rounded text-sm w-full"
                            placeholder="Size"
                          />
                          <input 
                            type="text" 
                            value={item.selected_color || ''}
                            onChange={(e) => handleItemChange(index, 'selected_color', e.target.value)}
                            className="px-2 py-1 bg-gray-50 border border-[#E8E4DE] rounded text-sm w-full"
                            placeholder="Color"
                          />
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 flex gap-3">
                          {item.selected_color && <span>Color: {item.selected_color}</span>}
                          {item.selected_size && <span>Size: {item.selected_size}</span>}
                          <span>Qty: {item.quantity}</span>
                          <span>Price: {formatPrice(item.price)}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                      <div className="font-bold text-[#0F3D2E]">
                        {formatPrice(item.price * item.quantity)}
                      </div>
                      {isEditing && (
                        <button 
                          onClick={() => handleRemoveItem(index)}
                          className="text-red-500 hover:text-red-700 p-1"
                          title="Remove Item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {(isEditing ? editItems : order.order_items)?.length === 0 && (
                  <div className="py-8 text-center text-gray-500">
                    No items in this order.
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <h3 className="font-bold text-[#0F3D2E] mb-4">Payment Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal</span>
                {isEditing ? (
                  <span className="font-medium">৳ {editForm.subtotal}</span>
                ) : (
                  <span>{formatPrice(order.subtotal || order.total)}</span>
                )}
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Delivery Charge</span>
                {isEditing ? (
                  <input 
                    type="number"
                    value={editForm.delivery_charge}
                    onChange={(e) => setEditForm({...editForm, delivery_charge: Number(e.target.value)})}
                    className="w-24 px-2 py-1 bg-gray-50 border border-[#E8E4DE] rounded text-right"
                  />
                ) : (
                  <span>{formatPrice(order.delivery_charge || 0)}</span>
                )}
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span>Discount</span>
                {isEditing ? (
                  <input 
                    type="number"
                    value={editForm.discount}
                    onChange={(e) => setEditForm({...editForm, discount: Number(e.target.value)})}
                    className="w-24 px-2 py-1 bg-green-50 border border-green-200 rounded text-right text-green-700"
                  />
                ) : (
                  <span>- {formatPrice(order.discount || 0)}</span>
                )}
              </div>
              <div className="pt-3 border-t border-[#E8E4DE] flex justify-between items-center font-bold text-lg text-[#0F3D2E]">
                <span>Total</span>
                {isEditing ? (
                  <span>৳ {editForm.total}</span>
                ) : (
                  <span>{formatPrice(order.total)}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <h3 className="font-bold text-[#0F3D2E] mb-4">Customer Details</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Name</p>
                {isEditing ? (
                  <input 
                    value={editForm.customer_name}
                    onChange={(e) => setEditForm({...editForm, customer_name: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg"
                  />
                ) : (
                  <p className="font-bold text-[#0F3D2E]">{order.customer_name || 'Guest User'}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Email</p>
                {isEditing ? (
                  <input 
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg"
                  />
                ) : (
                  <p className="font-medium text-[#0F3D2E]">{order.email || 'N/A'}</p>
                )}
              </div>
              <div>
                <p className="text-gray-500 mb-1">Phone</p>
                {isEditing ? (
                  <input 
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg"
                  />
                ) : (
                  <p className="font-medium text-[#0F3D2E]">{order.phone || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <h3 className="font-bold text-[#0F3D2E] mb-4">Shipping Address</h3>
            <div className="space-y-3 text-sm text-gray-600">
              {isEditing ? (
                <>
                  <div>
                    <label className="text-xs text-gray-500">Address</label>
                    <textarea 
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs text-gray-500">District</label>
                      <input 
                        value={editForm.district}
                        onChange={(e) => setEditForm({...editForm, district: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Division</label>
                      <input 
                        value={editForm.division}
                        onChange={(e) => setEditForm({...editForm, division: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p>{order.address}</p>
                  <p>{order.district}, {order.division}</p>
                </>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-[#E8E4DE] shadow-sm">
            <h3 className="font-bold text-[#0F3D2E] mb-4">Additional Info</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Payment Method</p>
                {isEditing ? (
                  <select 
                    value={editForm.payment_method}
                    onChange={(e) => setEditForm({...editForm, payment_method: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg"
                  >
                    <option value="cod">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                  </select>
                ) : (
                  <p className="font-medium text-[#0F3D2E] uppercase">{order.payment_method}</p>
                )}
              </div>
              
              <div>
                <p className="text-gray-500 mb-1">Customer Notes</p>
                {isEditing ? (
                  <textarea 
                    value={editForm.notes}
                    onChange={(e) => setEditForm({...editForm, notes: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg resize-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-600">{order.notes || 'None'}</p>
                )}
              </div>

              
              <div>
                <p className="text-gray-500 mb-1">Tracking Number</p>
                {isEditing ? (
                  <input 
                    value={editForm.tracking_number}
                    onChange={(e) => setEditForm({...editForm, tracking_number: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg"
                    placeholder="e.g. TRK-12345"
                  />
                ) : (
                  <p className="font-medium text-[#0F3D2E]">{order.tracking_number || 'N/A'}</p>
                )}
              </div>

              <div>
                <p className="text-gray-500 mb-1">Admin Notes (Internal)</p>
                {isEditing ? (
                  <textarea 
                    value={editForm.admin_notes}
                    onChange={(e) => setEditForm({...editForm, admin_notes: e.target.value})}
                    className="w-full px-3 py-2 bg-gray-50 border border-[#E8E4DE] rounded-lg resize-none"
                    rows={2}
                  />
                ) : (
                  <p className="text-gray-600">{order.admin_notes || 'None'}</p>
                )}
              </div>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
