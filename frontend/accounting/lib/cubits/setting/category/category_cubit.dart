import 'package:accounting/cubits/common/global_error_cubit.dart';
import 'package:accounting/cubits/common/global_loading_cubit.dart';
import 'package:accounting/cubits/common/global_toast_cubit.dart';
import 'package:accounting/cubits/setting/category/category_state.dart';
import 'package:accounting/models/setting/category/category_model.dart';
import 'package:accounting/services/setting/category/category_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CategoryCubit extends Cubit<CategoryState> {
  final String typeId;

  final GlobalErrorCubit globalErrorCubit;
  final GlobalLoadingCubit globalLoadingCubit;
  final GlobalToastCubit globalToastCubit;

  CategoryCubit(
    this.typeId,
    this.globalErrorCubit,
    this.globalLoadingCubit,
    this.globalToastCubit,
  ) : super(
        CategoryState(
          isInitialFetching: false,
          isSaving: false,
          isLastPage: false,
          isLoadingMore: false,
          isShowActive: true,
          isShowInactive: true,
          categoryList: [],
          stringParam: "",
          totalPage: 0,
          page: 1,
          size: 24,
          sort: 'id,DESC',
        ),
      ) {
    getCategoryByTypeId(isInitialFetching: true);
  }

  Future<void> getCategoryByTypeId({
    bool? isLoadNextPage,
    bool? isInitialFetching,
    bool? isRefetching,
    bool? isShowActive,
    bool? isShowInactive,
    String? stringParam,
  }) async {
    final isLoadMore = isLoadNextPage != null && isLoadNextPage;
    final isRefetch = isRefetching != null && isRefetching;
    final isInitLoad = isInitialFetching != null && isInitialFetching;

    try {
      if (isInitLoad) {
        emit(state.copyWith(page: 1));
        emit(state.copyWith(isInitialFetching: true));
      }

      if (isLoadMore) {
        emit(state.copyWith(isLoadingMore: true));
      }

      if (isRefetch) {
        emit(state.copyWith(page: 1));
        globalLoadingCubit.show();
      }

      bool? active;

      // Prefer explicit params, fallback to state
      final bool showActive = isShowActive ?? state.isShowActive;
      final bool showInactive = isShowInactive ?? state.isShowInactive;

      // Only when exactly one is selected
      if (showActive ^ showInactive) {
        active = showActive; // true = active, false = inactive
      }

      String param = stringParam ?? state.stringParam;

      final result = await CategoryService.getCategoryByTypeId(typeId, {
        if (active != null) 'active': active.toString(),
        if (param.isNotEmpty) "param": param,
        "page": state.page.toString(),
        "size": state.size.toString(),
        "sort": state.sort,
      });

      final list = result.data ?? [];
      final isLastPage = result.page >= result.totalPage;

      emit(
        state.copyWith(
          categoryList: isLoadMore ? [...state.categoryList, ...list] : list,
          stringParam: stringParam,
          isInitialFetching: false,
          isLoadingMore: false,
          isLastPage: isLastPage,
          isShowActive: showActive,
          isShowInactive: showInactive,
        ),
      );
      if (isRefetch) globalLoadingCubit.hide();
    } catch (e, stack) {
      globalErrorCubit.show(e, stack);
      emit(state.copyWith(isInitialFetching: false, isLoadingMore: false));
      if (isRefetch) globalLoadingCubit.hide();
    }
  }

  Future<void> loadNextPage() {
    emit(state.copyWith(page: state.page + 1));
    return getCategoryByTypeId(isLoadNextPage: true);
  }

  Future<bool> addNewCategoryWithType(
    AddCategoryReq category,
    bool isRefetch,
  ) async {
    try {
      globalLoadingCubit.show();
      await CategoryService.addNewCategoryWithType(category);
      globalToastCubit.show('Save successfully');

      if (isRefetch) getCategoryByTypeId(isRefetching: true);

      return true;
    } catch (e, stack) {
      globalErrorCubit.show(e, stack);
      return false;
    } finally {
      globalLoadingCubit.hide();
    }
  }

  Future<bool> updCategory(UpdCategoryReg category) async {
    try {
      globalLoadingCubit.show();
      await CategoryService.updateCategory(category);
      globalToastCubit.show('Save successfully');
      getCategoryByTypeId(isRefetching: true);

      return true;
    } catch (e, stack) {
      globalErrorCubit.show(e, stack);
      return false;
    } finally {
      globalLoadingCubit.hide();
    }
  }

  void updateActiveCheckbox(bool? value) {
    getCategoryByTypeId(
      isRefetching: true,
      isShowActive: value,
      isShowInactive: state.isShowInactive,
    );
  }

  void updateInactiveCheckbox(bool? value) {
    getCategoryByTypeId(
      isRefetching: true,
      isShowActive: state.isShowActive,
      isShowInactive: value,
    );
  }

  void searchWildcard(String stringParam) {
    getCategoryByTypeId(isRefetching: true, stringParam: stringParam.trim());
  }
}
