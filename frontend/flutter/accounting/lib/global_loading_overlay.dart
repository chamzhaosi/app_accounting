import 'package:accounting/cubits/common/global_loading_cubit.dart';
import 'package:accounting/theme/app_colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class GlobalLoadingOverlay extends StatelessWidget {
  const GlobalLoadingOverlay({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<GlobalLoadingCubit, bool>(
      builder: (context, loading) {
        if (!loading) return const SizedBox.shrink();

        return Positioned.fill(
          child: AbsorbPointer(
            absorbing: true,
            child: Container(
              color: AppColors.blackWithOpcity15,
              child: const Center(child: CircularProgressIndicator()),
            ),
          ),
        );
      },
    );
  }
}
