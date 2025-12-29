import 'dart:convert';
import 'package:accounting/models/setting/txn_type/txn_type_model.dart';
import 'package:accounting/services/api_response.dart';
import 'package:accounting/services/app_api.dart';
import 'package:http/http.dart' as http;

class TypeService {
  static Future<List<TxnType>> getTypeList() async {
    final res = await http.get(Uri.parse(AppApi.settingTxnTypeUrl));
    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final apiRes = ApiResponse<TxnType>.fromJson(
        body,
        (json) => TxnType.fromJson(json),
      );

      if (!apiRes.success) {
        throw Exception(apiRes.message ?? 'Unknown error');
      }

      return apiRes.data;
    } else {
      throw Exception('Failed to load transaction type');
    }
  }
}
