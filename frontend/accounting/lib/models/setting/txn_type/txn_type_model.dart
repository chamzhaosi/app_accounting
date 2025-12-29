class TxnType {
  final int id;
  final String typeCode;
  final String displayName;

  TxnType({
    required this.id,
    required this.typeCode,
    required this.displayName,
  });

  factory TxnType.fromJson(Map<String, dynamic> json) {
    return TxnType(
      id: json['id'],
      typeCode: json['typeCode'],
      displayName: json['displayName'],
    );
  }
}
