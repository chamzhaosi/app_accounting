import 'package:flutter/material.dart';

class SmallCardView extends StatelessWidget {
  final List<String> dataList;
  const SmallCardView({super.key, required this.dataList});

  @override
  Widget build(BuildContext context) {
    const numInRow = 3;
    const spacing = 12.0;

    final screenWidth = MediaQuery.of(context).size.width;
    final cardWidth = (screenWidth - spacing * 4) / numInRow;
    final gridWidth = cardWidth * numInRow + spacing * (numInRow - 1);

    final rows = <List<String>>[];
    for (int i = 0; i < dataList.length; i += numInRow) {
      rows.add(
        dataList.sublist(
          i,
          i + numInRow > dataList.length ? dataList.length : i + numInRow,
        ),
      );
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(vertical: 12),
      child: Center(
        child: SizedBox(
          width: gridWidth, // 🔥 fixed grid width
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
                        child: Card(child: Center(child: Text(item))),
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
