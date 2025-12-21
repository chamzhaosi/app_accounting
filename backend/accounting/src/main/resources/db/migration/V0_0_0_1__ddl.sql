CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL
);

CREATE TABLE transaction_types (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type_code VARCHAR(20) NOT NULL,
    display_name VARCHAR(50) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL
);

CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    label VARCHAR(50) NOT NULL,
    description VARCHAR(100) NOT NULL,
    type_id BIGINT NOT NULL,
    created_at DATETIME NOT NULL,
    updated_at DATETIME NULL,

    CONSTRAINT fk_categories_type
        FOREIGN KEY (type_id)
        REFERENCES transaction_types(id)
);

INSERT INTO transaction_types (type_code, display_name)
VALUES
('EXPENSE', 'Expense'),
('INCOME', 'Income');
