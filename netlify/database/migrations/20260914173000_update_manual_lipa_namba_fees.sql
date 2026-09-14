-- Switch from ZonmPay push fees to the manual Lipa Namba fees.
ALTER TABLE fursa_users DROP CONSTRAINT IF EXISTS fursa_users_activation_fee_check;
ALTER TABLE fursa_users ADD CONSTRAINT fursa_users_activation_fee_check CHECK (activation_fee IN (12000, 15000, 20000));

ALTER TABLE payment_requests DROP CONSTRAINT IF EXISTS payment_requests_amount_check;
ALTER TABLE payment_requests ADD CONSTRAINT payment_requests_amount_check CHECK (amount IN (12000, 15000, 20000));
