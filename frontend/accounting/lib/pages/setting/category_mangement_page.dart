import 'package:accounting/pages/setting/widgets/small_card_view.dart';
import 'package:accounting/routes/route_names.dart';
import 'package:accounting/theme/app_colors.dart';
import 'package:flutter/material.dart';

class CategoryMangementPage extends StatelessWidget {
  const CategoryMangementPage({super.key});

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
      length: 2,
      child: Scaffold(
        appBar: AppBar(
          title: Text('Category Management'),
          bottom: TabBar(
            tabs: [
              Tab(text: 'Income'),
              Tab(text: 'Expense'),
            ],
          ),
        ),
        body: const TabBarView(
          children: [
            SmallCardView(
              dataList: ['Salary', 'Bonus', 'Part-time', 'Cash Back'],
            ),
            SmallCardView(dataList: ['Meal', 'Other', 'Clothes', 'Sex Toy']),
          ],
        ),
        floatingActionButton: FloatingActionButton(
          onPressed: () {
            Navigator.pushNamed(context, RouteNames.settingAddCategoryForm);
          },
          shape: CircleBorder(),
          backgroundColor: AppColors.selectedTabBarBgColor,
          splashColor: AppColors.onPressLightGray,
          child: Icon(Icons.add, color: AppColors.white),
        ),
      ),
    );
  }
}
