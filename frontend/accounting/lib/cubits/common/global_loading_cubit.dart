import 'package:flutter_bloc/flutter_bloc.dart';

class GlobalLoadingCubit extends Cubit<bool> {
  GlobalLoadingCubit() : super(false);

  void show() => emit(true);
  void hide() => emit(false);
}
