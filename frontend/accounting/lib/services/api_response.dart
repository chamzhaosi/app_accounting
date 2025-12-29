class ApiResponse<T> {
  final bool success;
  final int code;
  final String? message;
  final List<T> data;

  ApiResponse({
    required this.success,
    required this.code,
    required this.data,
    this.message,
  });

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) fromJsonT,
  ) {
    return ApiResponse(
      success: json['success'],
      code: json['code'],
      message: json['message'],
      data: (json['data'] as List).map((e) => fromJsonT(e)).toList(),
    );
  }
}
