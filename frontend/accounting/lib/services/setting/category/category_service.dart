import 'dart:convert';

import 'package:accounting/models/setting/category/category_model.dart';
import 'package:accounting/services/api_response.dart';
import 'package:accounting/services/app_api.dart';
import 'package:http/http.dart' as http;

class CategoryService {
  static Future<List<Category>> getCategoryByTypeId(String typeId) async {
    final res = await http.get(
      Uri.parse('${AppApi.settingCategoryUrl}/$typeId'),
    );

    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final apiRes = ApiResponse<Category>.fromJson(
        body,
        (json) => Category.fromJson(json),
      );

      if (!apiRes.success) {
        throw Exception(apiRes.message ?? 'Unknow error');
      }

      return apiRes.data;
    } else {
      throw Exception('Failed to load category by type id');
    }
  }

  static Future<void> addNewCategoryWithType(AddCategoryReq category) async {
    final res = await http.post(
      Uri.parse(AppApi.settingCategoryUrl),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(category.toJson()),
    );

    if (res.statusCode != 200 && res.statusCode != 201) {
      throw Exception('Failed to create category');
    }
  }
}
