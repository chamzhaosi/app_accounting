import 'package:http/http.dart' as http;

class AppApi {
  static const mainUrl = 'http://10.0.2.2:8080/api';

  static const settingTxnTypeUrl = '$mainUrl/transaction_types';
  static const settingCategoryUrl = '$mainUrl/categories';

  static Future<http.Response> get(
    String urlString, [
    Map<String, String>? param,
  ]) async {
    final uri = Uri.parse(urlString).replace(queryParameters: param);
    return await http.get(uri, headers: {'Content-Type': 'application/json'});
  }
}
