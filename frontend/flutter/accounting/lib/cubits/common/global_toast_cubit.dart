import 'package:flutter_bloc/flutter_bloc.dart';

class GlobalToastCubit extends Cubit<String?> {
  GlobalToastCubit() : super(null);

  void show(String message) => emit(message);
  void clear() => emit(null);
}
