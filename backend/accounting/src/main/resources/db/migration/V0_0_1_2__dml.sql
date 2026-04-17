INSERT INTO transaction_types (label, nature, created_by, modified_by) VALUES
('Expense', '2', 'system', 'system'),
('Income', '1', 'system', 'system'),
('Adjust', null, 'system', 'system'),
('Transfer', null, 'system', 'system');

INSERT INTO account_types (label, created_by, modified_by) VALUES
('Cash', 'system', 'system'),
('E-wallet', 'system', 'system'),
('Bank', 'system', 'system'),
('Card', 'system', 'system');