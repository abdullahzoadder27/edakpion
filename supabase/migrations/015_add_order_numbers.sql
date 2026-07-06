CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

CREATE OR REPLACE FUNCTION get_order_prefix(num INT) RETURNS TEXT AS $$
DECLARE
    prefix TEXT := '';
    remainder INT;
BEGIN
    num := num + 1;
    WHILE num > 0 LOOP
        remainder := (num - 1) % 26;
        prefix := CHR(65 + remainder) || prefix;
        num := (num - 1) / 26;
    END LOOP;
    RETURN prefix;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION generate_order_number() RETURNS TRIGGER AS $$
DECLARE
    seq_val BIGINT;
    alpha_val INT;
    num_val INT;
    prefix TEXT;
    num_str TEXT;
BEGIN
    seq_val := nextval('order_number_seq');
    alpha_val := (seq_val - 1) / 999;
    num_val := ((seq_val - 1) % 999) + 1;
    
    prefix := get_order_prefix(alpha_val);
    num_str := LPAD(num_val::TEXT, 3, '0');
    
    NEW.order_number := prefix || num_str;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

DO $$
DECLARE
    r RECORD;
    seq_val BIGINT;
    alpha_val INT;
    num_val INT;
    prefix TEXT;
BEGIN
    FOR r IN SELECT id FROM orders WHERE order_number IS NULL ORDER BY created_at ASC LOOP
        seq_val := nextval('order_number_seq');
        alpha_val := (seq_val - 1) / 999;
        num_val := ((seq_val - 1) % 999) + 1;
        prefix := get_order_prefix(alpha_val);
        
        UPDATE orders 
        SET order_number = prefix || LPAD(num_val::TEXT, 3, '0') 
        WHERE id = r.id;
    END LOOP;
END;
$$;

DROP TRIGGER IF EXISTS set_order_number ON orders;
CREATE TRIGGER set_order_number
BEFORE INSERT ON orders
FOR EACH ROW
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION generate_order_number();
