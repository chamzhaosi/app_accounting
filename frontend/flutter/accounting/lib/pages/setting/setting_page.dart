import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:accounting/routes/route_names.dart';
import 'package:accounting/theme/app_colors.dart';
import 'package:flutter/material.dart';

class SettingPage extends StatelessWidget {
  const SettingPage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.setting),
        leading: IconButton(
          onPressed: () {},
          icon: Icon(Icons.arrow_back_ios_new),
        ),
      ),
      body: ListView.builder(
        itemCount: 1,
        itemBuilder: (BuildContext context, int index) {
          return ListTile(
            title: Text(l10n.category_management),
            trailing: Icon(Icons.arrow_forward_ios_outlined),
            splashColor: AppColors.onPressLightGray,
            onTap: () {
              Navigator.pushNamed(context, RouteNames.settingCategory);
            },
          );
        },
      ),
    );
  }
}
