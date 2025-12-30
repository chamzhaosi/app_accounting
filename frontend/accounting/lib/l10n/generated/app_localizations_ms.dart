// ignore: unused_import
import 'package:intl/intl.dart' as intl;
import 'app_localizations.dart';

// ignore_for_file: type=lint

/// The translations for Malay (`ms`).
class AppLocalizationsMs extends AppLocalizations {
  AppLocalizationsMs([String locale = 'ms']) : super(locale);

  @override
  String get category_exists_in_db => 'Kategori ini sudah wujud.';

  @override
  String get error_unknown => 'Ralat tidak dijangka berlaku.';

  @override
  String get no_found_page => 'Halaman tidak dijumpai';

  @override
  String get add_category => 'Tambah Kategori';

  @override
  String get setting => 'Tetapan';

  @override
  String get category_management => 'Pengurusan Kategori';

  @override
  String get no_category_available =>
      'Tiada kategori. Sila tambah satu untuk bermula.';

  @override
  String get no_type_available =>
      'Tiada jenis tersedia buat masa ini. Sila cuba lagi kemudian.';

  @override
  String get type => 'Jenis';

  @override
  String get label => 'Label';

  @override
  String get description => 'Penerangan';

  @override
  String enter_field(Object field) {
    return 'Sila masukkan $field';
  }

  @override
  String get save => 'Simpan';

  @override
  String get save_and_add_another => 'Simpan & Tambah Lagi';

  @override
  String max_length_error(Object max) {
    return 'Panjang maksimum ialah $max aksara';
  }

  @override
  String field_required(Object field) {
    return '$field diperlukan';
  }

  @override
  String get income => 'Pendapatan';

  @override
  String get expense => 'Perbelanjaan';
}
