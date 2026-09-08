import type { AppIconProps } from "../../components/AppIcon";

export type BookType = {
  id: string;
  label: string;
  normalized_label: string;
  description: string | null;
  icon: AppIconProps["name"];
  is_active: boolean;
  is_system_default: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type BookCreateReqType = {
  label: string;
  description?: string;
  icon: AppIconProps["name"];
};

export type BookUpdateReqType = BookCreateReqType & {
  id: string;
  isActive: boolean;
};
