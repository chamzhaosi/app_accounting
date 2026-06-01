import 'package:accounting/models/setting/category/category_model.dart';

class CategoryState {
  final bool isInitialFetching;
  final bool isSaving;
  final bool isLastPage;
  final bool isLoadingMore;
  final bool isShowActive;
  final bool isShowInactive;
  final List<Category> categoryList;
  final String stringParam;
  final int totalPage;
  final int page;
  final int size;
  final String sort;

  CategoryState({
    required this.isInitialFetching,
    required this.categoryList,
    required this.isSaving,
    required this.isLastPage,
    required this.isLoadingMore,
    required this.isShowActive,
    required this.isShowInactive,
    required this.stringParam,
    required this.totalPage,
    required this.page,
    required this.size,
    required this.sort,
  });

  CategoryState copyWith({
    bool? isInitialFetching,
    bool? isSaving,
    bool? isLoadingMore,
    bool? isLastPage,
    bool? isShowActive,
    bool? isShowInactive,
    List<Category>? categoryList,
    String? stringParam,
    int? totalPage,
    int? page,
    int? size,
    String? sort,
  }) {
    return CategoryState(
      isInitialFetching: isInitialFetching ?? this.isInitialFetching,
      isSaving: isSaving ?? this.isSaving,
      isLoadingMore: isLoadingMore ?? this.isLoadingMore,
      isLastPage: isLastPage ?? this.isLastPage,
      isShowActive: isShowActive ?? this.isShowActive,
      isShowInactive: isShowInactive ?? this.isShowInactive,
      categoryList: categoryList ?? this.categoryList,
      stringParam: stringParam ?? this.stringParam,
      totalPage: totalPage ?? this.totalPage,
      page: page ?? this.page,
      size: size ?? this.size,
      sort: sort ?? this.sort,
    );
  }
}
