class ApiResponse<T> {
  final bool success;
  final int code;
  final String? message;
  final List<T>? data;
  final Map<String, String>? fieldErrors;
  final String? errorText;

  ApiResponse({
    required this.success,
    required this.code,
    this.message,
    this.data,
    this.fieldErrors,
    this.errorText,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json, [
    T Function(Map<String, dynamic>)? fromJsonT,
  ]) {
    if (json['success'] == true) {
      return ApiResponse(
        success: true,
        code: json['code'],
        message: json['message'],
        data: fromJsonT != null
            ? (json['data'] as List).map((e) => fromJsonT(e)).toList()
            : json['data'],
      );
    }

    final rawData = json['data'];

    // 🔥 String error
    if (rawData is String) {
      return ApiResponse(
        success: false,
        code: json['code'],
        message: json['message'],
        errorText: rawData,
      );
    }

    // 🔥 Validation field errors
    if (rawData is Map<String, dynamic>) {
      return ApiResponse(
        success: false,
        code: json['code'],
        message: json['message'],
        fieldErrors: rawData.map((k, v) => MapEntry(k, v.toString())),
      );
    }

    return ApiResponse(
      success: false,
      code: json['code'],
      message: json['message'],
      errorText: 'Unknown error',
    );
  }
}
