import 'package:accounting/cubits/common/global_error_cubit.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_state.dart';
import 'package:accounting/services/setting/type/type_service.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class TxnTypeCubit extends Cubit<TxnTypeState> {
  final GlobalErrorCubit globalErrorCubit;

  TxnTypeCubit(this.globalErrorCubit)
    : super(TxnTypeState(txnTypeList: [], isFetching: false));

  Future<void> getTypeList() async {
    try {
      emit(state.copyWith(isFetching: true));
      final list = await TypeService.getTypeList();
      emit(state.copyWith(txnTypeList: list, isFetching: false));
    } catch (e, stack) {
      globalErrorCubit.show(e.toString(), stack);
      emit(state.copyWith(isFetching: false));
    }
  }
}
