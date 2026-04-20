INSERT INTO transaction_types (label, nature, created_by, modified_by) VALUES
('Expense', 'EXP', 'system', 'system'),
('Income', 'INC', 'system', 'system'),
('Adjust', "ADJ", 'system', 'system'),
('Transfer', "TSF", 'system', 'system');

INSERT INTO account_types (label, created_by, modified_by) VALUES
('Cash', 'system', 'system'),
('E-wallet', 'system', 'system'),
('Bank', 'system', 'system'),
('Card', 'system', 'system');