import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:flutter/material.dart';

class Notfoundpage extends StatelessWidget {
  const Notfoundpage({super.key});

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Center(child: Text(l10n.no_found_page));
  }
}
