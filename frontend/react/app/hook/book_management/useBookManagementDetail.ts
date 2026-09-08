import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AppToast } from "../../components/AppToast";
import {
  bookQueryKeys,
  invalidateQuery,
  resetBookScopedQueries,
} from "../../constants/queryKeys";
import {
  BOOK_MANAGEMENT_DEFAULT_VALUES,
  bookManagementSchema,
  type BookManagementFormType,
} from "../../forms/schemas/book_management.schema";
import { getBookById, updateBook } from "../../sql/service/bookService";
import { useBookStore } from "../../stores/useBookStore";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useBookManagementDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();
  const refreshActiveBook = useBookStore((state) => state.refreshActiveBook);
  const setActiveBook = useBookStore((state) => state.setActiveBook);
  const [isSaving, setIsSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [responseError, setResponseError] = useState("");
  const query = useQuery({
    queryKey: bookQueryKeys.detail(id),
    queryFn: () => getBookById(id),
    enabled: Boolean(id),
  });
  const form = useForm<BookManagementFormType>({
    resolver: zodResolver(bookManagementSchema),
    defaultValues: BOOK_MANAGEMENT_DEFAULT_VALUES,
    mode: "onChange",
  });
  useEffect(() => {
    if (!query.data) return;
    form.reset({
      label: query.data.label,
      description: query.data.description ?? "",
      icon: query.data.icon,
    });
    setIsActive(Boolean(query.data.is_active));
  }, [form.reset, query.data]);
  const onSubmit = async (value: BookManagementFormType) => {
    try {
      setIsSaving(true);
      setResponseError("");
      const error = await updateBook({
        ...value,
        id,
        isActive,
      });
      if (error) {
        setResponseError(error);
        return;
      }
      await Promise.all([
        invalidateQuery(queryClient, bookQueryKeys.lists()),
        invalidateQuery(queryClient, bookQueryKeys.detail(id)),
        refreshActiveBook(),
      ]);
      AppToast.success({ message: "Book updated successfully" });
      router.back();
    } catch (error) {
      console.error(DEBUG_TAG.BOOK, "Unable to update book", error);
      AppToast.error({ message: "Unable to update Book." });
    } finally {
      setIsSaving(false);
    }
  };
  const onSelectBook = async () => {
    if (!query.data) return;
    await resetBookScopedQueries(queryClient);
    await setActiveBook(query.data);
    router.replace("/(home)/dashboard");
  };
  return {
    ...form,
    book: query.data,
    isActive,
    isLoading: query.isLoading,
    isSaving,
    onSubmit,
    onSelectBook,
    responseError,
    setIsActive,
  };
}
