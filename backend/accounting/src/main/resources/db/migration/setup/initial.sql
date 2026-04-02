CREATE TABLE users(
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(100) NOT NULL UNIQUE,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0
);

CREATE TABLE users_psw(
  id BIGINT     PRIMARY KEY AUTO_INCREMENT,
  password      VARCHAR(255) NOT NULL,
  user_id       BIGINT NOT NULL,
  status        VARCHAR(50) NOT NULL,
  expired_at    DATETIME NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_users_psw_users
      FOREIGN KEY (user_id)
      REFERENCES users(id)
);

CREATE TABLE users_lgn(
  id BIGINT     PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  failed_count  BIGINT NOT NULL DEFAULT 0,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_users_lgn_users
      FOREIGN KEY (user_id)
      REFERENCES users(id)
);

CREATE TABLE users_forget_psw(
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  token         VARCHAR(255) NOT NULL,
  expired_at    DATETIME NOT NULL,
  status        VARCHAR(50) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_user_forget_psw_users
      FOREIGN KEY (user_id)
      REFERENCES users(id)
);

CREATE TABLE transaction_types (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT,
  label         VARCHAR(50) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_txn_types_users
    FOREIGN KEY (user_id)
    REFERENCES users(id),

  CONSTRAINT uq_txn_types_user_label
    UNIQUE (user_id, label)
);

INSERT INTO transaction_types (label, created_by, modified_by) VALUES
('Expense', 'system', 'system'),
('Income', 'system', 'system'),
('Adjust', 'system', 'system'),
('Transfer', 'system', 'system');

CREATE TABLE categories (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  txn_type_id   BIGINT NOT NULL,
  label         VARCHAR(50) NOT NULL,
  description   VARCHAR(100) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_ctgr_txn_types
    FOREIGN KEY (txn_type_id)
    REFERENCES transaction_types(id),

  CONSTRAINT fk_ctgr_users
    FOREIGN KEY (user_id)
    REFERENCES users(id),

  CONSTRAINT uq_ctgr_user_label
    UNIQUE (user_id, label)
);

CREATE TABLE account_types (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT,
  label         VARCHAR(50) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_acc_types_users
    FOREIGN KEY (user_id)
    REFERENCES users(id),

  CONSTRAINT uq_acc_types_user_label
    UNIQUE (user_id, label)
);

INSERT INTO account_types (label, created_by, modified_by) VALUES
('Cash', 'system', 'system'),
('E-wallet', 'system', 'system'),
('Bank', 'system', 'system'),
('Card', 'system', 'system');

CREATE TABLE accounts (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  acc_type_id   BIGINT NOT NULL,
  label         VARCHAR(50) NOT NULL,
  description   VARCHAR(100) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_acc_acc_types
    FOREIGN KEY (acc_type_id)
    REFERENCES account_types(id),

  CONSTRAINT fk_acc_users
    FOREIGN KEY (user_id)
    REFERENCES users(id)
);

CREATE TABLE transactions (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  txn_type_id   BIGINT NOT NULL,
  ctgr_id       BIGINT NOT NULL,
  acc_type_id   BIGINT NOT NULL,
  description   VARCHAR(255) NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_txn_users
    FOREIGN KEY (user_id)
    REFERENCES users(id),

  CONSTRAINT fk_txn_txn_type_id
    FOREIGN KEY (txn_type_id)
    REFERENCES transaction_types(id),

  CONSTRAINT fk_txn_ctgrs
    FOREIGN KEY (ctgr_id)
    REFERENCES categories(id),

  CONSTRAINT fk_txn_accs
    FOREIGN KEY (acc_type_id)
    REFERENCES account_types(id)
);