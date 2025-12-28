import 'package:accounting/routes/app_routes.dart';
import 'package:accounting/routes/route_names.dart';
import 'package:accounting/theme/app_theme.dart';
import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      themeMode: ThemeMode.system, // system / light / dark
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.dartTheme,
      initialRoute: RouteNames.setting,
      onGenerateRoute: AppRoutes.generate,
    );
  }
}
