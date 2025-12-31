import 'package:accounting/cubits/setting/category/category_cubit.dart';
import 'package:accounting/cubits/setting/category/category_state.dart';
import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:accounting/pages/setting/widgets/small_card_info_view.dart';
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
  late AppLocalizations l10n;

  @override
  void initState() {
    categoryCubit = context.read<CategoryCubit>();
    categoryCubit.getCategoryByTypeId(widget.typeId);
    super.initState();
  }

  @override
  void didChangeDependencies() {
    l10n = AppLocalizations.of(context)!;
    super.didChangeDependencies();
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
          return Center(child: Text(l10n.no_category_available));
        }

        return SmallCardInfoView(
          dataList: state.categoryList
              .map(
                (c) => SmallCardInfo(
                  label: c.label,
                  info: c.description!.isEmpty ? null : c.description,
                ),
              )
              .toList(),
        );
      },
    );
  }
}
