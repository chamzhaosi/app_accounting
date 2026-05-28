import 'package:accounting/pages/setting/account_management/small_card_info_view.dart';
import 'package:accounting/routes/route_names.dart';
import 'package:accounting/theme/app_colors.dart';
import 'package:flutter/material.dart';

class AccountCfg {
  final String label;
  final IconData icon;
  final List<SmallCardInfo> children;

  AccountCfg({required this.label, required this.icon, required this.children});
}

class AccountManagementPage extends StatelessWidget {
  const AccountManagementPage({super.key});

  @override
  Widget build(BuildContext context) {
    final List<AccountCfg> accountListCfg = [
      AccountCfg(
        label: 'Bank',
        icon: Icons.house_outlined,
        children: [
          SmallCardInfo(label: 'Maybank', active: true),
          SmallCardInfo(
            label: 'Gx Bank',
            active: true,
            description: 'Just for saving',
          ),
        ],
      ),
      AccountCfg(
        label: 'E-wallet',
        icon: Icons.wallet,
        children: [
          SmallCardInfo(label: 'Tng', active: true),
          SmallCardInfo(label: 'MCash', active: false),
        ],
      ),
    ];

    return Scaffold(
      appBar: AppBar(title: Text('Account Management')),
      body: ListView.builder(
        itemCount: accountListCfg.length,
        itemBuilder: (context, index) {
          final e = accountListCfg[index];
          final ScrollController scrollCtrl = ScrollController();

          return ExpansionTile(
            title: Text(e.label),
            leading: Icon(e.icon),
            children: [
              Container(
                height: 200,
                color: AppColors.blackWithOpcity15,
                child: Padding(
                  padding: const EdgeInsets.only(top: 8.0),
                  child: SmallCardInfoView<SmallCardInfo>(
                    dataList: e.children,
                    scrollCtrl: scrollCtrl,
                    isLastPage: true,
                  ),
                ),
              ),
            ],
          );
        },
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          Navigator.pushNamed(context, RouteNames.settingAddAccountForm);
        },
        backgroundColor: AppColors.selectedTabBarBgColor,
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }
}
