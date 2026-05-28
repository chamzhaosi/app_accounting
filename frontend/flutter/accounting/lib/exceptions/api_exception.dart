class ApiException<T> implements Exception {
  final T? beErrCode;
  final String message;

  ApiException({this.beErrCode, required this.message});

  @override
  String toString() => 'ApiException(code: $beErrCode, message: $message)';
}
