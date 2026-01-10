// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Chinese (`zh`).
class AppLocalizationsZh extends AppLocalizations {
  AppLocalizationsZh([String locale = 'zh']) : super(locale);

  @override
  String get category_exists_in_db => '该分类已存在。';

  @override
  String get error_unknown => '发生未知错误。';

  @override
  String get no_found_page => '找不到页面';

  @override
  String get add_category => '新增分类';

  @override
  String get setting => '设置';

  @override
  String get category_management => '分类管理';

  @override
  String get no_category_available => '暂无分类，请先新增一个。';

  @override
  String get no_type_available => '当前没有可用类型，请稍后再试。';

  @override
  String get type => '类型';

  @override
  String get label => '名称';

  @override
  String get description => '描述';

  @override
  String enter_field(Object field) {
    return '请输入$field';
  }

  @override
  String get save => '保存';

  @override
  String get save_and_add_another => '保存并继续新增';

  @override
  String max_length_error(Object max) {
    return '最多只能输入 $max 个字符';
  }

  @override
  String field_required(Object field) {
    return '$field为必填项';
  }

  @override
  String get income => '收入';

  @override
  String get expense => '支出';

  @override
  String get active => '启用';

  @override
  String get inactive => '停用';

  @override
  String get search => '搜索';

  @override
  String get update => '更新';

  @override
  String get noMoreData => '-- 没有更多数据了 --';
}
