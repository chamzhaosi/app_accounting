import 'package:accounting/cubits/common/global_error_cubit.dart';
import 'package:accounting/cubits/common/global_loading_cubit.dart';
import 'package:accounting/cubits/common/global_toast_cubit.dart';
import 'package:accounting/global_error_listener.dart';
import 'package:accounting/global_loading_overlay.dart';
import 'package:accounting/global_toast_listener.dart';
import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:accounting/routes/app_routes.dart';
import 'package:accounting/routes/route_names.dart';
import 'package:accounting/theme/app_theme.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

void main() {
  runApp(
    MultiBlocProvider(
      providers: [
        BlocProvider(create: (_) => GlobalErrorCubit()),
        BlocProvider(create: (_) => GlobalLoadingCubit()),
        BlocProvider(create: (_) => GlobalToastCubit()),
      ],
      child: const MyApp(),
    ),
  );
}

final GlobalKey<NavigatorState> appNavigatorKey = GlobalKey<NavigatorState>();

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      locale: Locale('en'),
      localizationsDelegates: AppLocalizations.localizationsDelegates,
      supportedLocales: AppLocalizations.supportedLocales,
      navigatorKey: appNavigatorKey,
      themeMode: ThemeMode.system,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.dartTheme,
      initialRoute: RouteNames.setting,
      onGenerateRoute: AppRoutes.generate,
      builder: (context, child) {
        return GlobalErrorListener(
          child: GlobalToastListener(
            child: Stack(children: [child!, const GlobalLoadingOverlay()]),
          ),
        );
      },
    );
  }
}
