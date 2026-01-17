import 'package:accounting/pages/not_found_page.dart';
import 'package:accounting/pages/setting/category_management/category_mangement_page.dart';
import 'package:accounting/pages/setting/setting_page.dart';
import 'package:accounting/routes/route_names.dart';
import 'package:flutter/material.dart';

class AppRoutes {
  static Route<dynamic> generate(RouteSettings settings) {
    switch (settings.name) {
      case RouteNames.setting:
        return MaterialPageRoute(builder: (_) => const SettingPage());

      case RouteNames.settingCategory:
        return MaterialPageRoute(builder: (_) => const CategoryMangementPage());

      default:
        return MaterialPageRoute(builder: (_) => const Notfoundpage());
    }
  }
}
