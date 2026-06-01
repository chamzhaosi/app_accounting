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

class ApiPageResponse<T> extends ApiResponse<T> {
  final int totalPage;
  final int page;
  final int size;

  ApiPageResponse({
    required super.code,
    required super.success,
    super.message,
    super.data,
    super.fieldErrors,
    super.errorText,
    required this.totalPage,
    required this.page,
    required this.size,
  });

  factory ApiPageResponse.fromJson(
    Map<String, dynamic> json, [
    T Function(Map<String, dynamic>)? fromJsonT,
  ]) {
    if (json['success'] == true) {
      return ApiPageResponse(
        success: true,
        code: json['code'],
        message: json['message'],
        data: fromJsonT != null
            ? (json['data'] as List).map((e) => fromJsonT(e)).toList()
            : json['data'],
        totalPage: json['totalPage'],
        page: json['page'],
        size: json['size'],
      );
    }

    final rawData = json['data'];

    // 🔥 String error
    if (rawData is String) {
      return ApiPageResponse(
        success: false,
        code: json['code'],
        message: json['message'],
        errorText: rawData,
        totalPage: json['totalPage'],
        page: json['page'],
        size: json['size'],
      );
    }

    // 🔥 Validation field errors
    if (rawData is Map<String, dynamic>) {
      return ApiPageResponse(
        success: false,
        code: json['code'],
        message: json['message'],
        fieldErrors: rawData.map((k, v) => MapEntry(k, v.toString())),
        totalPage: json['totalPage'],
        page: json['page'],
        size: json['size'],
      );
    }

    return ApiPageResponse(
      success: false,
      code: json['code'],
      message: json['message'],
      errorText: 'Unknown error',
      totalPage: json['totalPage'],
      page: json['page'],
      size: json['size'],
    );
  }
}
