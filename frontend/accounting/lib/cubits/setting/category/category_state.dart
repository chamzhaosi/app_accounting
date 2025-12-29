import 'package:accounting/models/setting/category/category_model.dart';

class CategoryState {
  final bool isFetching;
  final bool isSaving;
  final List<Category> categoryList;

  CategoryState({
    required this.isFetching,
    required this.categoryList,
    required this.isSaving,
  });

  CategoryState copyWith({
    bool? isFetching,
    bool? isSaving,
    List<Category>? categoryList,
  }) {
    return CategoryState(
      isFetching: isFetching ?? this.isFetching,
      isSaving: isSaving ?? this.isSaving,
      categoryList: categoryList ?? this.categoryList,
    );
  }
}
