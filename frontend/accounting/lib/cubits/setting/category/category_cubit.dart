import 'package:accounting/cubits/common/global_error_cubit.dart';
import 'package:accounting/cubits/common/global_loading_cubit.dart';
import 'package:accounting/cubits/common/global_toast_cubit.dart';
import 'package:accounting/cubits/setting/category/category_state.dart';
import 'package:accounting/models/setting/category/category_model.dart';
import 'package:accounting/services/setting/category/category_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CategoryCubit extends Cubit<CategoryState> {
  final GlobalErrorCubit globalErrorCubit;
  final GlobalLoadingCubit globalLoadingCubit;
  final GlobalToastCubit globalToastCubit;

  CategoryCubit(
    this.globalErrorCubit,
    this.globalLoadingCubit,
    this.globalToastCubit,
  ) : super(
        CategoryState(isFetching: false, isSaving: false, categoryList: []),
      );

  Future<void> getCategoryByTypeId(String typeId) async {
    try {
      emit(state.copyWith(isFetching: true));
      final list = await CategoryService.getCategoryByTypeId(typeId);
      emit(state.copyWith(categoryList: list, isFetching: false));
    } catch (e, stack) {
      globalErrorCubit.show(e.toString(), stack);
      emit(state.copyWith(isFetching: false));
    }
  }

  Future<void> addNewCategoryWithType(
    AddCategoryReq category,
    bool isRefetch,
  ) async {
    try {
      globalLoadingCubit.show();
      await CategoryService.addNewCategoryWithType(category);
      globalToastCubit.show('Save successfully');

      if (isRefetch) getCategoryByTypeId(category.typeId.toString());
    } catch (e, stack) {
      globalErrorCubit.show(e.toString(), stack);
    } finally {
      globalLoadingCubit.hide();
    }
  }
}
