import { db } from "./database";

export const insertAccTypTable = async () => {
  await db.execAsync(`
    INSERT INTO account_types (name) VALUES ('Cash');
    INSERT INTO account_types (name) VALUES ('Bank');
    INSERT INTO account_types (name) VALUES ('E-Wallet');
  `);
};
