import 'package:accounting/cubits/setting/category/category_cubit.dart';
import 'package:accounting/cubits/setting/category/category_state.dart';
import 'package:accounting/pages/setting/widgets/small_card_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CategoryTabBarView extends StatefulWidget {
  final String typeId;

  const CategoryTabBarView({super.key, required this.typeId});

  @override
  State<CategoryTabBarView> createState() => _CategoryTabBarViewState();
}

class _CategoryTabBarViewState extends State<CategoryTabBarView> {
  late CategoryCubit categoryCubit;

  @override
  void initState() {
    categoryCubit = context.read<CategoryCubit>();
    categoryCubit.getCategoryByTypeId(widget.typeId);
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<CategoryCubit, CategoryState>(
      buildWhen: (previous, current) =>
          previous.isFetching != current.isFetching ||
          previous.categoryList.length != current.categoryList.length,
      builder: (context, state) {
        if (state.isFetching) {
          return Center(child: CircularProgressIndicator());
        }

        if (state.categoryList.isEmpty) {
          return Center(
            child: Text(
              'No category available at the moment. Please try again later.',
            ),
          );
        }

        return SmallCardView(
          dataList: state.categoryList.map((c) => c.label).toList(),
        );
      },
    );
  }
}
