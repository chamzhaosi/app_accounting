import 'package:accounting/cubits/setting/category/category_cubit.dart';
import 'package:accounting/cubits/setting/category/category_state.dart';
import 'package:accounting/helper/common/debouncer.dart';
import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:accounting/pages/setting/widgets/small_card_info_view.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CategoryTabBarView extends StatefulWidget {
  const CategoryTabBarView({super.key});

  @override
  State<CategoryTabBarView> createState() => _CategoryTabBarViewState();
}

class _CategoryTabBarViewState extends State<CategoryTabBarView>
    with AutomaticKeepAliveClientMixin {
  @override
  bool get wantKeepAlive => true;

  late CategoryCubit categoryCubit;
  late AppLocalizations l10n;
  final debouncer = Debouncer(milliseconds: 500);
  final ScrollController scrollCtrl = ScrollController();

  @override
  void initState() {
    categoryCubit = context.read<CategoryCubit>();
    scrollCtrl.addListener(() {
      if (scrollCtrl.position.pixels >=
              scrollCtrl.position.maxScrollExtent - 120 &&
          !categoryCubit.state.isInitialFetching &&
          !categoryCubit.state.isLoadingMore &&
          !categoryCubit.state.isLastPage) {
        categoryCubit.loadNextPage();
      }
    });
    super.initState();
  }

  @override
  void didChangeDependencies() {
    l10n = AppLocalizations.of(context)!;
    super.didChangeDependencies();
  }

  @override
  void dispose() {
    scrollCtrl.dispose();
    debouncer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return BlocBuilder<CategoryCubit, CategoryState>(
      buildWhen: (previous, current) =>
          previous.isInitialFetching != current.isInitialFetching ||
          previous.categoryList != current.categoryList ||
          previous.isShowActive != current.isShowActive ||
          previous.isShowInactive != current.isShowInactive,
      builder: (context, state) {
        if (state.isInitialFetching) {
          return Center(child: CircularProgressIndicator());
        }

        return GestureDetector(
          onTap: () => FocusScope.of(context).unfocus(),
          behavior: HitTestBehavior.translucent,
          child: RefreshIndicator(
            onRefresh: () =>
                categoryCubit.getCategoryByTypeId(isRefetching: true),
            child:
                state.categoryList.isEmpty &&
                    state.stringParam.isEmpty &&
                    state.isShowActive &&
                    state.isShowInactive
                ? CustomScrollView(
                    physics: const AlwaysScrollableScrollPhysics(),
                    slivers: [
                      SliverFillRemaining(
                        hasScrollBody: false,
                        child: Center(child: Text(l10n.no_category_available)),
                      ),
                    ],
                  )
                : Column(
                    children: [
                      Padding(
                        padding: const EdgeInsets.all(8.0),
                        child: Row(
                          children: [
                            Expanded(
                              child: Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 8.0,
                                ),
                                child: searchField(
                                  context,
                                  (String value) => debouncer.run(
                                    () => categoryCubit.searchWildcard(value),
                                  ),
                                ),
                              ),
                            ),
                            checkboxFields(
                              context,
                              state.isShowActive,
                              (bool? value) =>
                                  categoryCubit.updateActiveCheckbox(value),
                              state.isShowInactive,
                              (bool? value) =>
                                  categoryCubit.updateInactiveCheckbox(value),
                            ),
                          ],
                        ),
                      ),
                      Expanded(
                        child: SmallCardInfoView(
                          dataList: state.categoryList,
                          scrollCtrl: scrollCtrl,
                          isLastPage: state.isLastPage,
                        ),
                      ),
                    ],
                  ),
          ),
        );
      },
    );
  }
}

Widget searchField(BuildContext ctx, void Function(String value) cb) {
  final l10n = AppLocalizations.of(ctx)!;
  return TextFormField(
    decoration: InputDecoration(
      border: OutlineInputBorder(),
      labelText: l10n.search,
      isDense: true,
      contentPadding: EdgeInsets.symmetric(vertical: 8, horizontal: 12),
    ),
    onChanged: cb,
  );
}

Widget checkboxFields(
  BuildContext ctx,
  bool actVal,
  void Function(bool? value) actCb,
  bool inActVal,
  void Function(bool? value) inActCb,
) {
  final l10n = AppLocalizations.of(ctx)!;
  return Column(
    mainAxisSize: MainAxisSize.min,
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      checkbox(l10n.active, actVal, actCb),
      checkbox(l10n.inactive, inActVal, inActCb),
    ],
  );
}

Widget checkbox(String title, bool val, void Function(bool? value) cb) {
  return Row(
    children: [
      Transform.scale(
        scale: 0.85,
        child: Checkbox(
          value: val,
          materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
          visualDensity: const VisualDensity(horizontal: -4, vertical: -4),
          onChanged: cb,
        ),
      ),
      Text(title),
    ],
  );
}
