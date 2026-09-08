import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useMemo } from "react";
import type { AppListItemType } from "../../components/AppListView";
import { bookQueryKeys } from "../../constants/queryKeys";
import { BOOK_MANAGEMENT_DETAIL_URL } from "../../constants/urls";
import { getBooks } from "../../sql/service/bookService";
import type { AppIconProps } from "../../components/AppIcon";
import { useTranslation } from "../../i18n/helper";

export default function useBookManagementList() {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: bookQueryKeys.list(true),
    queryFn: () => getBooks(true),
  });
  const items = useMemo<AppListItemType[]>(
    () =>
      (query.data ?? []).map((book) => ({
        id: book.id,
        icon: book.icon as AppIconProps["name"],
        label: book.label,
        descriptions: `${t(book.is_active ? "Active" : "Inactive")}${
          book.is_system_default ? ` · ${t("System Book")}` : ""
        }`,
        onPress: () =>
          router.push({
            pathname: BOOK_MANAGEMENT_DETAIL_URL as never,
            params: { id: book.id },
          }),
      })),
    [query.data, t],
  );
  return { ...query, items };
}
