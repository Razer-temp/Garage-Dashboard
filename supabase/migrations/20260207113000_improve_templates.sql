-- Migration to improve pre-built message templates
-- This script replaces the basic templates with more professional versions

-- First, delete existing pre-built templates to avoid duplicates
-- (Assuming pre-built templates have specific names or can be identified)
DELETE FROM communication_templates 
WHERE name IN (
    'Vehicle Ready', 
    'Payment Request', 
    'Service Due Reminder', 
    'Welcome/Thank You', 
    'Job Status Update', 
    'Inspection Complete'
);

-- Insert the new and improved templates
INSERT INTO communication_templates (name, content, category)
VALUES 
(
    'Vehicle Ready', 
    'Dear {customer_name}, Great news! Your {bike_model} ({reg_number}) is ready for pickup at {garage_name}. The final invoice amount is ₹{invoice_amount}. We are open until [Time]. Looking forward to seeing you! - Team {garage_name} {garage_phone}',
    'Pickup'
),
(
    'Payment Request', 
    'Hello {customer_name}, we hope you''re happy with the service on your {bike_model}. This is a gentle reminder regarding the outstanding balance of ₹{pending_amount}. You can complete the payment at the garage or via our digital link. Thank you! - {garage_name}',
    'Billing'
),
(
    'Service Due Reminder', 
    'Hi {customer_name}! It''s time for your {bike_model}''s routine check-up. Regular service ensures better performance and safety. Book your slot at {garage_name} today to keep your ride smooth! Phone: {garage_phone}',
    'Reminder'
),
(
    'Welcome/Thank You', 
    'Hi {customer_name}, thank you for choosing {garage_name} for your {bike_model} service! We value your trust. If you have a moment, please share your feedback here: {feedback_link}. Have a safe ride!',
    'General'
),
(
    'Job Status Update', 
    'Hello {customer_name}, just a quick update: we''ve started working on your {bike_model} ({reg_number}). We''ll keep you posted on the progress and let you know as soon as it''s ready. - {garage_name}',
    'Status'
),
(
    'Inspection Complete', 
    'Hi {customer_name}, we''ve completed the initial inspection of your {bike_model}. The estimated cost for repairs is ₹{invoice_amount}. Please let us know if we should proceed. - Team {garage_name}',
    'Status'
);
