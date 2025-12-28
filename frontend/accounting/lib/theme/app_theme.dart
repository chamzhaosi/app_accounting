import 'package:accounting/theme/app_colors.dart';
import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.primary,
      brightness: Brightness.light,
    ),
    scaffoldBackgroundColor: AppColors.white,
    tabBarTheme: TabBarThemeData(
      indicator: BoxDecoration(color: AppColors.selectedTabBarBgColor),
      indicatorSize: TabBarIndicatorSize.tab,
      labelColor: AppColors.white,
      unselectedLabelColor: Colors.grey,
    ),
  );

  static ThemeData dartTheme = ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.black,
      brightness: Brightness.dark,
    ),
    scaffoldBackgroundColor: AppColors.black,
  );
}
