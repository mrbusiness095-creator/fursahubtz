-- Move existing service fees to the manual Lipa Namba pricing.
-- The original 20260914150000 migration must remain unchanged because it
-- has already been applied in production.

UPDATE fursa_users
SET activation_fee = CASE service
  WHEN 'chat' THEN 12000
  WHEN 'mikopo' THEN 15000
  WHEN 'ajira' THEN 20000
END
WHERE activation_fee IN (14000, 15000, 16000);

UPDATE payment_requests
SET amount = CASE service
  WHEN 'chat' THEN 12000
  WHEN 'mikopo' THEN 15000
  WHEN 'ajira' THEN 20000
END
WHERE amount IN (14000, 15000, 16000);

ALTER TABLE fursa_users DROP CONSTRAINT IF EXISTS fursa_users_activation_fee_check;
ALTER TABLE fursa_users
  ADD CONSTRAINT fursa_users_activation_fee_check
  CHECK (activation_fee IN (12000, 15000, 20000));

ALTER TABLE payment_requests DROP CONSTRAINT IF EXISTS payment_requests_amount_check;
ALTER TABLE payment_requests
  ADD CONSTRAINT payment_requests_amount_check
  CHECK (amount IN (12000, 15000, 20000));
