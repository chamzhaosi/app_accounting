import 'package:accounting/exceptions/api_exception.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class GlobalErrorCubit extends Cubit<dynamic> {
  GlobalErrorCubit() : super(null);

  void show(dynamic error, [StackTrace? stack]) {
    dynamic errCode;
    String message;

    if (error is ApiException) {
      message = error.message;
      errCode = error.beErrCode;
    } else {
      message = error is String ? error : normalizeError(error);
    }

    if (kDebugMode) {
      const red = '\x1B[31m';
      const yellow = '\x1B[33m';
      const reset = '\x1B[0m';

      debugPrint('$red❌ ERROR: $message$reset');

      if (errCode != null) {
        debugPrint('$yellow📍 ERROR CODE: $errCode$reset');
      }

      if (stack != null) {
        debugPrint('$yellow📍 STACKTRACE:$reset\n$stack');
      }
    }
    emit(errCode ?? message);
  }

  void clear() => emit(null);
}

String normalizeError(Object e) {
  final msg = e.toString();
  if (msg.startsWith('Exception: ')) {
    return msg.replaceFirst('Exception: ', '');
  }
  return msg;
}
