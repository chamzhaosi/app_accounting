import 'package:accounting/models/setting/txn_type/txn_type_model.dart';

class TxnTypeState {
  final bool isFetching;
  final List<TxnType> txnTypeList;

  TxnTypeState({required this.txnTypeList, required this.isFetching});

  TxnTypeState copyWith({bool? isFetching, List<TxnType>? txnTypeList}) {
    return TxnTypeState(
      isFetching: isFetching ?? this.isFetching,
      txnTypeList: txnTypeList ?? this.txnTypeList,
    );
  }
}
