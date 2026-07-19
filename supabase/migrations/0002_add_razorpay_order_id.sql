-- Run this only if you already executed schema.sql before this file existed.
-- If you're setting up fresh, schema.sql already includes this column — skip this file.

alter table entries add column if not exists razorpay_order_id text unique;
