import 'package:accounting/cubits/setting/category/category_cubit.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_cubit.dart';
import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:accounting/models/setting/category/category_model.dart';
import 'package:accounting/pages/setting/category_management/category_form.dart';
import 'package:accounting/theme/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:just_the_tooltip/just_the_tooltip.dart';

class SmallCardInfo {
  final String? info;
  final String label;
  final bool active;

  SmallCardInfo({required this.label, this.info, required this.active});
}

class SmallCardInfoView extends StatelessWidget {
  final List<Category> dataList;
  final ScrollController scrollCtrl;
  final bool isLastPage;

  const SmallCardInfoView({
    super.key,
    required this.dataList,
    required this.scrollCtrl,
    required this.isLastPage,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    const numInRow = 3;
    const spacing = 12.0;

    final screenWidth = MediaQuery.of(context).size.width;
    final cardWidth = (screenWidth - spacing * 4) / numInRow;
    final gridWidth = cardWidth * numInRow + spacing * (numInRow - 1);

    final rows = <List<Category>>[];
    for (int i = 0; i < dataList.length; i += numInRow) {
      rows.add(
        dataList.sublist(
          i,
          (i + numInRow) > dataList.length ? dataList.length : i + numInRow,
        ),
      );
    }

    return SingleChildScrollView(
      controller: scrollCtrl,
      physics: const AlwaysScrollableScrollPhysics(),
      padding: const EdgeInsets.only(bottom: 12),
      child: Center(
        child: SizedBox(
          width: gridWidth,
          child: Column(
            children: [
              ...rows.map((row) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: spacing),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.start,
                    children: row.map((item) {
                      return Padding(
                        padding: const EdgeInsets.symmetric(
                          horizontal: spacing / 3,
                        ),
                        child: SizedBox(
                          width: cardWidth,
                          height: 90,
                          child: Material(
                            elevation: 2,
                            borderRadius: BorderRadius.circular(12),
                            color: item.active ? null : AppColors.dangerous,
                            child: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                InkWell(
                                  onTap: () {
                                    FocusScope.of(context).unfocus();
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => MultiBlocProvider(
                                          providers: [
                                            BlocProvider.value(
                                              value: context
                                                  .read<TxnTypeCubit>(),
                                            ),
                                            BlocProvider.value(
                                              value: context
                                                  .read<CategoryCubit>(),
                                            ),
                                          ],
                                          child: CategoryForm(category: item),
                                        ),
                                      ),
                                    );
                                  },
                                  borderRadius: BorderRadius.circular(12),
                                  splashColor: AppColors.onPressLightBlue,
                                  child: Center(child: Text(item.label)),
                                ),

                                // Top-right info icon
                                if (item.description != null &&
                                    item.description!.isNotEmpty)
                                  Positioned(
                                    right: 3,
                                    top: 3,
                                    child: JustTheTooltip(
                                      triggerMode: TooltipTriggerMode.tap,
                                      content: Padding(
                                        padding: const EdgeInsets.all(8),
                                        child: Text(
                                          item.description!,
                                          style: const TextStyle(
                                            color: Colors.white,
                                          ),
                                        ),
                                      ),
                                      backgroundColor: Colors.black87,
                                      borderRadius: BorderRadius.circular(8),
                                      child: const Icon(
                                        Icons.info_outline,
                                        size: 25,
                                        color: AppColors.primaryWithOpcity50,
                                      ),
                                    ),
                                  ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                );
              }),

              Container(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: isLastPage
                    ? Text(
                        l10n.noMoreData,
                        style: TextStyle(color: AppColors.primaryWithOpcity50),
                      )
                    : CircularProgressIndicator(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
