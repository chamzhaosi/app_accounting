import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AppToast } from "../../components/AppToast";
import { bookQueryKeys, invalidateQuery } from "../../constants/queryKeys";
import {
  BOOK_MANAGEMENT_DEFAULT_VALUES,
  bookManagementSchema,
  type BookManagementFormType,
} from "../../forms/schemas/book_management.schema";
import { createBook } from "../../sql/service/bookService";
import { DEBUG_TAG } from "../../utils/debugLog";

export default function useBookManagementCreate() {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [responseError, setResponseError] = useState("");
  const form = useForm<BookManagementFormType>({
    resolver: zodResolver(bookManagementSchema),
    defaultValues: BOOK_MANAGEMENT_DEFAULT_VALUES,
    mode: "onChange",
  });
  const onSubmit = async (value: BookManagementFormType) => {
    try {
      setIsSaving(true);
      setResponseError("");
      const result = await createBook(value);
      if (typeof result === "string") {
        setResponseError(result);
        return;
      }
      await invalidateQuery(queryClient, bookQueryKeys.lists());
      AppToast.success({ message: "Book created successfully" });
      router.back();
    } catch (error) {
      console.error(DEBUG_TAG.BOOK, "Unable to create book", error);
      AppToast.error({ message: "Unable to create Book." });
    } finally {
      setIsSaving(false);
    }
  };
  return { ...form, isSaving, onSubmit, responseError };
}
