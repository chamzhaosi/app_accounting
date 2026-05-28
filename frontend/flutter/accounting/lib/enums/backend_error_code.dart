enum BackendErrorCode {
  validationFailed('VALIDATION_FAILED'),
  invalidFormat('INVALID_FORMAT'),
  notFound("NOT_FOUND"),
  existsInDb('EXISTS_IN_DB');

  final String code;
  const BackendErrorCode(this.code);

  static BackendErrorCode? fromCode(String? code) {
    for (final e in BackendErrorCode.values) {
      if (e.code == code) return e;
    }
    return null;
  }
}
