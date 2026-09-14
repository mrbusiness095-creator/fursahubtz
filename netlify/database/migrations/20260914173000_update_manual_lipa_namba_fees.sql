-- Move existing service fees to the manual Lipa Namba pricing.
-- The original 20260914150000 migration must remain unchanged because it
-- has already been applied in production.
--
-- Order matters: the old CHECK constraints only permit (14000, 15000, 16000),
-- so they must be dropped BEFORE the rows are rewritten to the new prices.
-- Updating first makes Postgres reject the new values
-- ("new row for relation ... violates check constraint").

ALTER TABLE fursa_users DROP CONSTRAINT IF EXISTS fursa_users_activation_fee_check;
ALTER TABLE payment_requests DROP CONSTRAINT IF EXISTS payment_requests_amount_check;

UPDATE fursa_users
SET activation_fee = CASE service
  WHEN 'chat' THEN 12000
  WHEN 'mikopo' THEN 15000
  WHEN 'ajira' THEN 20000
  ELSE activation_fee
END
WHERE activation_fee IN (14000, 15000, 16000);

UPDATE payment_requests
SET amount = CASE service
  WHEN 'chat' THEN 12000
  WHEN 'mikopo' THEN 15000
  WHEN 'ajira' THEN 20000
  ELSE amount
END
WHERE amount IN (14000, 15000, 16000);

-- Re-add the constraints once every row satisfies the new pricing.
ALTER TABLE fursa_users
  ADD CONSTRAINT fursa_users_activation_fee_check
  CHECK (activation_fee IN (12000, 15000, 20000));

ALTER TABLE payment_requests
  ADD CONSTRAINT payment_requests_amount_check
  CHECK (amount IN (12000, 15000, 20000));
