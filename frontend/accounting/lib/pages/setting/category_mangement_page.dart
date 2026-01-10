import 'package:accounting/cubits/common/global_error_cubit.dart';
import 'package:accounting/cubits/common/global_loading_cubit.dart';
import 'package:accounting/cubits/common/global_toast_cubit.dart';
import 'package:accounting/cubits/setting/category/category_cubit.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_cubit.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_state.dart';
import 'package:accounting/helper/type/type_label_map.dart';
import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:accounting/pages/setting/category_form.dart';
import 'package:accounting/pages/setting/category_tab_bar_view.dart';
import 'package:accounting/theme/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CategoryMangementPage extends StatefulWidget {
  const CategoryMangementPage({super.key});

  @override
  State<CategoryMangementPage> createState() => _CategoryMangementPageState();
}

class _CategoryMangementPageState extends State<CategoryMangementPage>
    with TickerProviderStateMixin {
  TabController? _tabController;
  final Map<String, CategoryCubit> _categoryCubits = {};

  @override
  void dispose() {
    for (final c in _categoryCubits.values) {
      c.close();
    }
    _tabController?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;

    return BlocProvider(
      create: (_) =>
          TxnTypeCubit(context.read<GlobalErrorCubit>())..getTypeList(),
      child: BlocBuilder<TxnTypeCubit, TxnTypeState>(
        builder: (context, state) {
          if (state.isFetching) {
            return const Scaffold(
              body: Center(child: CircularProgressIndicator()),
            );
          }

          if (state.txnTypeList.isEmpty) {
            return Scaffold(
              appBar: AppBar(title: Text(l10n.category_management)),
              body: Center(child: Text(l10n.no_type_available)),
            );
          }

          _tabController ??= TabController(
            length: state.txnTypeList.length,
            vsync: this,
          );

          final tabs = state.txnTypeList.map((e) {
            return Tab(text: TypeLabelMap.fromBELabel(l10n, e.typeCode));
          }).toList();

          return Scaffold(
            appBar: AppBar(
              title: Text(l10n.category_management),
              bottom: TabBar(controller: _tabController, tabs: tabs),
            ),
            body: TabBarView(
              controller: _tabController,
              children: state.txnTypeList.map((t) {
                _categoryCubits.putIfAbsent(
                  t.id.toString(),
                  () => CategoryCubit(
                    t.id.toString(),
                    context.read<GlobalErrorCubit>(),
                    context.read<GlobalLoadingCubit>(),
                    context.read<GlobalToastCubit>(),
                  ),
                );

                return BlocProvider.value(
                  value: _categoryCubits[t.id.toString()]!,
                  child: const CategoryTabBarView(),
                );
              }).toList(),
            ),
            floatingActionButton: FloatingActionButton(
              onPressed: () async {
                final index = _tabController!.index;
                final type = state.txnTypeList[index];

                await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => MultiBlocProvider(
                      providers: [
                        BlocProvider.value(value: context.read<TxnTypeCubit>()),
                        BlocProvider.value(
                          value: _categoryCubits[type.id.toString()]!,
                        ),
                      ],
                      child: CategoryForm(initialTypeId: type.id.toString()),
                    ),
                  ),
                );
              },
              backgroundColor: AppColors.selectedTabBarBgColor,
              child: const Icon(Icons.add, color: Colors.white),
            ),
          );
        },
      ),
    );
  }
}
