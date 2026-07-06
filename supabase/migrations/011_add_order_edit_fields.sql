ALTER TABLE orders ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS admin_notes TEXT;

CREATE OR REPLACE FUNCTION handle_order_deletion()
RETURNS TRIGGER AS $$
DECLARE
  item RECORD;
BEGIN
  -- Restore stock if the order wasn't already cancelled
  IF OLD.status != 'cancelled' THEN
    FOR item IN SELECT * FROM order_items WHERE order_id = OLD.id
    LOOP
      UPDATE products
      SET stock = stock + item.quantity
      WHERE id = item.product_id;
    END LOOP;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_restore_stock_on_delete ON orders;
CREATE TRIGGER trigger_restore_stock_on_delete
BEFORE DELETE ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_order_deletion();
