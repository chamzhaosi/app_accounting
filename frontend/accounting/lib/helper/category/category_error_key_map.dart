import 'package:accounting/enums/backend_error_code.dart';

enum CategoryErrorKey { existsInDb, unknown }

class CategoryErrorKeyMap {
  static CategoryErrorKey? messageFromCode(String? code) {
    final err = BackendErrorCode.fromCode(code);

    switch (err) {
      case BackendErrorCode.existsInDb:
        return CategoryErrorKey.existsInDb;
      default:
        return null;
    }
  }
}
