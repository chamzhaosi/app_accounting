import 'package:flutter/material.dart';

class SmallCardView extends StatelessWidget {
  final List<String> dataList;
  const SmallCardView({super.key, required this.dataList});

  @override
  Widget build(BuildContext context) {
    final double cardWidth = MediaQuery.of(context).size.width / 3 - 16;

    return Align(
      alignment: AlignmentGeometry.topCenter,
      child: SingleChildScrollView(
        padding: EdgeInsetsGeometry.all(8),
        child: Wrap(
          alignment: WrapAlignment.start,
          spacing: 12,
          runSpacing: 12,
          children: List.generate(dataList.length, (index) {
            return SizedBox(
              width: cardWidth,
              height: 90,
              child: Card(child: Center(child: Text(dataList[index]))),
            );
          }),
        ),
      ),
    );
  }
}
