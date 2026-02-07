-- Migration: Automated Inventory Deduction
-- Description: Subtracts stock from inventory_items when parts are added to a job, and restores it when deleted or quantity changes.

-- 1. Create the deduction function
CREATE OR REPLACE FUNCTION public.handle_inventory_deduction()
RETURNS TRIGGER AS $$
DECLARE
    item_stock INTEGER;
BEGIN
    -- Handle INSERT (Subtract stock)
    IF (TG_OP = 'INSERT') THEN
        IF NEW.inventory_item_id IS NOT NULL THEN
            UPDATE public.inventory_items
            SET stock_quantity = stock_quantity - NEW.quantity
            WHERE id = NEW.inventory_item_id;
        END IF;

    -- Handle DELETE (Add stock back)
    ELSIF (TG_OP = 'DELETE') THEN
        IF OLD.inventory_item_id IS NOT NULL THEN
            UPDATE public.inventory_items
            SET stock_quantity = stock_quantity + OLD.quantity
            WHERE id = OLD.inventory_item_id;
        END IF;

    -- Handle UPDATE (Adjust based on delta)
    ELSIF (TG_OP = 'UPDATE') THEN
        -- If the item itself changed
        IF OLD.inventory_item_id IS NOT NULL AND OLD.inventory_item_id <> NEW.inventory_item_id THEN
            -- Restore old item stock
            UPDATE public.inventory_items
            SET stock_quantity = stock_quantity + OLD.quantity
            WHERE id = OLD.inventory_item_id;
            
            -- Subtract new item stock
            IF NEW.inventory_item_id IS NOT NULL THEN
                UPDATE public.inventory_items
                SET stock_quantity = stock_quantity - NEW.quantity
                WHERE id = NEW.inventory_item_id;
            END IF;
        -- If only quantity changed for the same item
        ELSIF NEW.inventory_item_id IS NOT NULL AND OLD.quantity <> NEW.quantity THEN
            UPDATE public.inventory_items
            SET stock_quantity = stock_quantity - (NEW.quantity - OLD.quantity)
            WHERE id = NEW.inventory_item_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Create the Trigger
DROP TRIGGER IF EXISTS tr_job_parts_inventory_deduction ON public.job_parts;
CREATE TRIGGER tr_job_parts_inventory_deduction
AFTER INSERT OR UPDATE OR DELETE ON public.job_parts
FOR EACH ROW
EXECUTE FUNCTION public.handle_inventory_deduction();

-- 3. (Optional) Initial Sync if needed, but safer to let it start from now
-- Commented out to avoid double deductions for existing parts if any.
-- UPDATE inventory_items i
-- SET stock_quantity = stock_quantity - (SELECT COALESCE(SUM(quantity), 0) FROM job_parts WHERE inventory_item_id = i.id);
