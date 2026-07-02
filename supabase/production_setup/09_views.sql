-- 09_views.sql
CREATE OR REPLACE VIEW public.dashboard_summary AS
SELECT 
    (SELECT COUNT(*) FROM public.orders) as total_orders,
    (SELECT COALESCE(SUM(total_amount), 0) FROM public.orders WHERE status = 'delivered') as total_revenue,
    (SELECT COUNT(*) FROM public.profiles) as total_customers,
    (SELECT COUNT(*) FROM public.products) as total_products;

CREATE OR REPLACE VIEW public.recent_orders AS
SELECT o.id, o.order_number, p.full_name as customer_name, o.total_amount, o.status, o.created_at
FROM public.orders o
LEFT JOIN public.profiles p ON o.user_id = p.id
ORDER BY o.created_at DESC
LIMIT 10;

CREATE OR REPLACE VIEW public.low_stock_products AS
SELECT p.name as product_name, v.sku, i.stock, i.low_stock_threshold
FROM public.inventory i
JOIN public.product_variants v ON i.variant_id = v.id
JOIN public.products p ON v.product_id = p.id
WHERE i.stock <= i.low_stock_threshold;
