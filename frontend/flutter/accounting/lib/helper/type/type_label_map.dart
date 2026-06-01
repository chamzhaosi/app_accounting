import 'package:accounting/l10n/generated/app_localizations.dart';

class TypeLabelMap {
  static String fromBELabel(AppLocalizations l10n, dynamic code) {
    switch (code) {
      case 'EXPENSE':
        return l10n.expense;
      case 'INCOME':
        return l10n.income;
      default:
        return code;
    }
  }
}
