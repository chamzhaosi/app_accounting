import 'package:accounting/cubits/common/global_toast_cubit.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class GlobalToastListener extends StatelessWidget {
  final Widget child;
  const GlobalToastListener({required this.child});

  @override
  Widget build(BuildContext context) {
    return BlocListener<GlobalToastCubit, String?>(
      listener: (context, message) {
        if (message == null) return;

        WidgetsBinding.instance.addPostFrameCallback((_) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(message),
              behavior: SnackBarBehavior.floating,
            ),
          );
          context.read<GlobalToastCubit>().clear();
        });
      },
      child: child,
    );
  }
}
