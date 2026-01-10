import 'dart:convert';

import 'package:accounting/exceptions/api_exception.dart';
import 'package:accounting/helper/category/category_error_key_map.dart';
import 'package:accounting/models/setting/category/category_model.dart';
import 'package:accounting/services/api_response.dart';
import 'package:accounting/services/app_api.dart';
import 'package:http/http.dart' as http;

class CategoryService {
  static Future<ApiPageResponse<Category>> getCategoryByTypeId(
    String typeId,
    Map<String, String> params,
  ) async {
    final res = await AppApi.get(
      '${AppApi.settingCategoryUrl}/$typeId',
      params,
    );

    if (res.statusCode == 200) {
      final body = jsonDecode(res.body);
      final apiRes = ApiPageResponse<Category>.fromJson(
        body,
        (json) => Category.fromJson(json),
      );

      if (!apiRes.success) {
        if (apiRes.fieldErrors != null) {
          throw Exception(apiRes.fieldErrors!.values.join(", "));
        } else {
          throw Exception(
            apiRes.errorText ?? apiRes.message ?? 'Unknown error',
          );
        }
      }

      return apiRes;
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
      final body = jsonDecode(res.body);
      final apiRes = ApiResponse<Category>.fromJson(body);

      if (apiRes.fieldErrors != null) {
        throw ApiException(message: apiRes.fieldErrors!.values.join(","));
      } else {
        throw ApiException<CategoryErrorKey>(
          beErrCode: CategoryErrorKeyMap.messageFromCode(apiRes.message),
          message: apiRes.errorText ?? 'Unknown error',
        );
      }
    }
  }

  static Future<void> updateCategory(UpdCategoryReg category) async {
    final res = await http.put(
      Uri.parse('${AppApi.settingCategoryUrl}/${category.id}'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(category.toJson()),
    );

    if (res.statusCode != 200 && res.statusCode != 201) {
      final body = jsonDecode(res.body);
      final apiRes = ApiResponse<Category>.fromJson(body);

      if (apiRes.fieldErrors != null) {
        throw ApiException(message: apiRes.fieldErrors!.values.join(","));
      } else {
        throw ApiException<CategoryErrorKey>(
          beErrCode: CategoryErrorKeyMap.messageFromCode(apiRes.message),
          message: apiRes.errorText ?? 'Unknown error',
        );
      }
    }
  }
}
