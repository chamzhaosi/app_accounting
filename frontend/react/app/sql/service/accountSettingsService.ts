import {
  getAccountSettingsFromDB,
  saveAccountSettingsToDB,
} from "../repo/accountSettingsRepo";
import type { AccountSettingsType } from "../types/accountSettingsType";

export const getAccountSettings = async () => getAccountSettingsFromDB();

export const saveAccountSettings = async (data: AccountSettingsType) =>
  saveAccountSettingsToDB(data);
