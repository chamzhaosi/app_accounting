import 'package:accounting/cubits/common/global_error_cubit.dart';
import 'package:accounting/helper/category/category_error_key_map.dart';
import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:accounting/main.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class GlobalErrorListener extends StatelessWidget {
  final Widget child;
  const GlobalErrorListener({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return BlocListener<GlobalErrorCubit, dynamic>(
      listener: (context, message) {
        if (message == null) return;

        WidgetsBinding.instance.addPostFrameCallback((_) {
          final ctx = appNavigatorKey.currentContext;
          if (ctx == null) return;

          showDialog(
            context: ctx,
            builder: (_) => AlertDialog(
              title: const Text('Error'),
              content: Text(genL10nErrorMessage(context, message)),
              actions: [
                TextButton(
                  onPressed: () {
                    ctx.read<GlobalErrorCubit>().clear();
                    Navigator.pop(ctx);
                  },
                  child: const Text('OK'),
                ),
              ],
            ),
          );
        });
      },
      child: child,
    );
  }

  String genL10nErrorMessage(BuildContext context, dynamic code) {
    switch (code) {
      case CategoryErrorKey.existsInDb:
        return AppLocalizations.of(context)!.category_exists_in_db;
      default:
        return code;
    }
  }
}
