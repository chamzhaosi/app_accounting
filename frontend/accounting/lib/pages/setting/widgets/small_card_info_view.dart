import 'package:accounting/theme/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:just_the_tooltip/just_the_tooltip.dart';

class SmallCardInfo {
  final String? info;
  final String label;

  SmallCardInfo({required this.label, this.info});
}

class SmallCardInfoView extends StatelessWidget {
  final List<SmallCardInfo> dataList;
  const SmallCardInfoView({super.key, required this.dataList});

  @override
  Widget build(BuildContext context) {
    const numInRow = 3;
    const spacing = 12.0;

    final screenWidth = MediaQuery.of(context).size.width;
    final cardWidth = (screenWidth - spacing * 4) / numInRow;
    final gridWidth = cardWidth * numInRow + spacing * (numInRow - 1);

    final rows = <List<SmallCardInfo>>[];
    for (int i = 0; i < dataList.length; i += numInRow) {
      rows.add(
        dataList.sublist(
          i,
          (i + numInRow) > dataList.length ? dataList.length : i + numInRow,
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: SizedBox(
          width: gridWidth,
          child: Column(
            children: rows.map((row) {
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
                          child: Stack(
                            clipBehavior: Clip.none,
                            children: [
                              InkWell(
                                onTap: () {},
                                borderRadius: BorderRadius.circular(12),
                                splashColor: AppColors.onPressLightBlue,
                                child: Center(child: Text(item.label)),
                              ),

                              // Top-right info icon
                              if (item.info != null)
                                Positioned(
                                  right: 3,
                                  top: 3,
                                  child: JustTheTooltip(
                                    triggerMode: TooltipTriggerMode.tap,
                                    content: Padding(
                                      padding: const EdgeInsets.all(8),
                                      child: Text(
                                        item.info!,
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
            }).toList(),
          ),
        ),
      ),
    );
  }
}
