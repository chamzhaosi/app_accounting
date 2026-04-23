CREATE TABLE users(
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  email         VARCHAR(100) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT uq_email_is_active
      UNIQUE (email, is_active)
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

CREATE TABLE users_refresh_token(
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  expired_at    DATETIME NOT NULL,
  token         VARCHAR(255) NOT NULL,
  -- 'U' = Used, 'A' = Active, 'I' = Inactive, 'E' = Expired
  status        VARCHAR(50) NOT NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_user_refresh_token_users
      FOREIGN KEY (user_id)
      REFERENCES users(id)
);

CREATE TABLE transaction_types (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT,
  label         VARCHAR(50) NOT NULL,
  nature        VARCHAR(10) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  active_flag   TINYINT
    GENERATED ALWAYS AS (
        CASE
            WHEN deleted_at IS NULL THEN 1
            ELSE NULL
        END
    ) STORED,
  deleted_at    DATETIME NULL,
  deleted_by    VARCHAR(100) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_txn_types_users
    FOREIGN KEY (user_id)
    REFERENCES users(id),

  CONSTRAINT uq_txn_types_user_active_flag
    UNIQUE (user_id, active_flag)
);

CREATE TABLE categories (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  txn_type_id   BIGINT NOT NULL,
  label         VARCHAR(50) NOT NULL,
  description   VARCHAR(100) NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  active_flag   TINYINT
    GENERATED ALWAYS AS (
        CASE
            WHEN deleted_at IS NULL THEN 1
            ELSE NULL
        END
    ) STORED,
  deleted_at    DATETIME NULL,
  deleted_by    VARCHAR(100) NULL,
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

  CONSTRAINT uq_ctgr_user_type_id_active_flag
    UNIQUE (user_id, txn_type_id, active_flag)
);

CREATE TABLE account_types (
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT,
  label         VARCHAR(50) NOT NULL,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  active_flag   TINYINT
    GENERATED ALWAYS AS (
        CASE
            WHEN deleted_at IS NULL THEN 1
            ELSE NULL
        END
    ) STORED,
  deleted_at    DATETIME NULL,
  deleted_by    VARCHAR(100) NULL,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by    VARCHAR(100),
  modified_at   DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by   VARCHAR(100),
  vrs           BIGINT DEFAULT 0,

  CONSTRAINT fk_acc_types_users
    FOREIGN KEY (user_id)
    REFERENCES users(id),

  CONSTRAINT uq_acc_types_user_active_flag
    UNIQUE (user_id, active_flag)
);

CREATE TABLE accounts (
  id                 BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id            BIGINT NOT NULL,
  acc_type_id        BIGINT NOT NULL,
  label              VARCHAR(50) NOT NULL,
  description        VARCHAR(100) NOT NULL,
  opening_balance    DECIMAL(10,2) DEFAULT 0.00,
  current_balance    DECIMAL(10,2) DEFAULT 0.00,
  is_main_account    BOOLEAN NOT NULL DEFAULT TRUE,
  is_active          BOOLEAN NOT NULL DEFAULT TRUE,
  active_flag   TINYINT
    GENERATED ALWAYS AS (
        CASE
            WHEN deleted_at IS NULL THEN 1
            ELSE NULL
        END
    ) STORED,
  deleted_at    DATETIME NULL,
  deleted_by    VARCHAR(100) NULL,
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
    REFERENCES users(id),

  CONSTRAINT uq_acc_types_user_acc_type_active_flag
    UNIQUE (user_id, acc_type_id, active_flag)
);

CREATE TABLE transactions (
  id                    BIGINT PRIMARY KEY AUTO_INCREMENT,
  transfer_group_id     VARCHAR(50) NULL,
  user_id               BIGINT NOT NULL,
  txn_type_id           BIGINT NOT NULL,
  ctgr_id               BIGINT NULL,
  acc_id                BIGINT NOT NULL,
  description           VARCHAR(255) NULL,
  amount                DECIMAL(10,2) NOT NULL,
  txn_date              DATE NOT NULL,
  deleted_at            DATETIME NULL,
  deleted_by            VARCHAR(100) NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by            VARCHAR(100),
  modified_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by           VARCHAR(100),
  vrs                   BIGINT DEFAULT 0,

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
    FOREIGN KEY (acc_id)
    REFERENCES accounts(id)
);

CREATE TABLE budget {
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id       BIGINT NOT NULL,
  month         BIGINT NOT NULL,
  total_budget  DECIMAL(10,2) NOT NULL,
}

CREATE TABLE budget_categories{
  id            BIGINT PRIMARY KEY AUTO_INCREMENT,
  budget_id     BIGINT NOT NULL,
  ctgr_id       BIGINT NOT NULL,
  amount        DECIMAL(10,2) NOT NULL,
  active_flag   TINYINT
    GENERATED ALWAYS AS (
      CASE
        WHEN deleted_at IS NULL THEN 1
        ELSE NULL
    )
  deleted_at            DATETIME NULL,
  deleted_by            VARCHAR(100) NULL,
  created_at            DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_by            VARCHAR(100),
  modified_at           DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  modified_by           VARCHAR(100),
  vrs                   BIGINT DEFAULT 0,
}