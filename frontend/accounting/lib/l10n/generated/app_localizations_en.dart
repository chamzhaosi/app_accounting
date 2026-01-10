// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for English (`en`).
class AppLocalizationsEn extends AppLocalizations {
  AppLocalizationsEn([String locale = 'en']) : super(locale);

  @override
  String get category_exists_in_db => 'This category already exists.';

  @override
  String get error_unknown => 'An unexpected error occurred.';

  @override
  String get no_found_page => 'Page not found';

  @override
  String get add_category => 'Add Category';

  @override
  String get setting => 'Setting';

  @override
  String get category_management => 'Category Management';

  @override
  String get no_category_available =>
      'No categories available. Please add one to get started.';

  @override
  String get no_type_available =>
      'No types available at the moment. Please try again later.';

  @override
  String get type => 'Type';

  @override
  String get label => 'Label';

  @override
  String get description => 'Description';

  @override
  String enter_field(Object field) {
    return 'Please enter $field';
  }

  @override
  String get save => 'Save';

  @override
  String get save_and_add_another => 'Save & Add Another';

  @override
  String max_length_error(Object max) {
    return 'Maximum length is $max characters';
  }

  @override
  String field_required(Object field) {
    return '$field is required';
  }

  @override
  String get income => 'Income';

  @override
  String get expense => 'Expense';

  @override
  String get active => 'Active';

  @override
  String get inactive => 'Inactive';

  @override
  String get search => 'Search';

  @override
  String get update => 'Update';

  @override
  String get noMoreData => '-- No more data --';
}
