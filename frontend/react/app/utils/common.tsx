import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ACCOUNT_TYPE_ICONS } from "../constants/account_type";
import { Box, LucideIcon } from "lucide-react-native";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const itemMap = new Map(ACCOUNT_TYPE_ICONS.map((i) => [i.id, i.icon]));
export const getItemIcon = (name: string): LucideIcon =>
  itemMap.get(name) ?? Box;
