import 'package:accounting/cubits/common/global_error_cubit.dart';
import 'package:accounting/cubits/common/global_loading_cubit.dart';
import 'package:accounting/cubits/common/global_toast_cubit.dart';
import 'package:accounting/cubits/setting/category/category_cubit.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_cubit.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_state.dart';
import 'package:accounting/pages/setting/add_category_form.dart';
import 'package:accounting/pages/setting/category_tab_bar_view.dart';
import 'package:accounting/theme/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class CategoryMangementPage extends StatelessWidget {
  const CategoryMangementPage({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(
          create: (context) =>
              TxnTypeCubit(context.read<GlobalErrorCubit>())..getTypeList(),
        ),
        BlocProvider(
          create: (context) => CategoryCubit(
            context.read<GlobalErrorCubit>(),
            context.read<GlobalLoadingCubit>(),
            context.read<GlobalToastCubit>(),
          ),
        ),
      ],
      child: BlocBuilder<TxnTypeCubit, TxnTypeState>(
        buildWhen: (p, c) =>
            p.txnTypeList.length != c.txnTypeList.length ||
            p.isFetching != c.isFetching,
        builder: (context, state) {
          List<Tab> tabs = state.txnTypeList.map((e) {
            return Tab(text: e.displayName);
          }).toList();

          return DefaultTabController(
            length: state.txnTypeList.length,
            child: Scaffold(
              appBar: AppBar(
                title: Text('Category Management'),
                bottom: state.isFetching || state.txnTypeList.isEmpty
                    ? null
                    : TabBar(tabs: tabs),
              ),
              body: state.isFetching
                  ? Center(child: CircularProgressIndicator())
                  : state.txnTypeList.isEmpty
                  ? Center(
                      child: Text(
                        'No type available at the moment. Please try again later.',
                      ),
                    )
                  : TabBarView(
                      children: state.txnTypeList.map((t) {
                        return CategoryTabBarView(typeId: t.id.toString());
                      }).toList(),
                    ),
              floatingActionButton: Builder(
                builder: (btnContext) {
                  final controller = DefaultTabController.of(btnContext);

                  return FloatingActionButton(
                    onPressed: () {
                      final selectedTypeId = state
                          .txnTypeList[controller.index]
                          .id
                          .toString();
                      Navigator.push(
                        btnContext,
                        MaterialPageRoute(
                          builder: (_) => MultiBlocProvider(
                            providers: [
                              BlocProvider.value(
                                value: btnContext.read<TxnTypeCubit>(),
                              ),
                              BlocProvider.value(
                                value: btnContext.read<CategoryCubit>(),
                              ),
                            ],
                            child: AddCategoryForm(
                              initialTypeId: selectedTypeId,
                            ),
                          ),
                        ),
                      );
                    },
                    shape: CircleBorder(),
                    backgroundColor: AppColors.selectedTabBarBgColor,
                    splashColor: AppColors.onPressLightGray,
                    child: Icon(Icons.add, color: AppColors.white),
                  );
                },
              ),
            ),
          );
        },
      ),
    );
  }
}
