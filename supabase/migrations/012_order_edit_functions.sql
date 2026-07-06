CREATE OR REPLACE FUNCTION delete_order_and_restore_stock(p_order_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Stock is restored by the trigger on DELETE IF it wasn't cancelled
  DELETE FROM orders WHERE id = p_order_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_order_item_stock(p_product_id UUID, p_quantity_diff INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE products SET stock = stock - p_quantity_diff WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
