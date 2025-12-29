import 'package:flutter/foundation.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class GlobalErrorCubit extends Cubit<String?> {
  GlobalErrorCubit() : super(null);

  void show(String message, [StackTrace? stack]) {
    if (kDebugMode) {
      const red = '\x1B[31m';
      const yellow = '\x1B[33m';
      const reset = '\x1B[0m';

      debugPrint('$red❌ ERROR: $message$reset');

      if (stack != null) {
        debugPrint('$yellow📍 STACKTRACE:$reset\n$stack');
      }
    }
    emit(message);
  }

  void clear() => emit(null);
}
