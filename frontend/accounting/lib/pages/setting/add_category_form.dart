import 'package:accounting/cubits/setting/category/category_cubit.dart';
import 'package:accounting/cubits/setting/category/category_state.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_cubit.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_state.dart';
import 'package:accounting/helper/type/type_label_map.dart';
import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:accounting/models/setting/category/category_model.dart';
import 'package:accounting/models/setting/txn_type/txn_type_model.dart';
import 'package:accounting/theme/app_colors.dart';
import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class AddCategoryForm extends StatefulWidget {
  final String initialTypeId;

  const AddCategoryForm({super.key, required this.initialTypeId});

  @override
  State<AddCategoryForm> createState() => _AddCategoryFormState();
}

class _AddCategoryFormState extends State<AddCategoryForm> {
  final labelCtrl = TextEditingController();
  final descCtrl = TextEditingController();
  late String selectedTypeId;

  @override
  void initState() {
    selectedTypeId = widget.initialTypeId;
    super.initState();
  }

  @override
  void dispose() {
    labelCtrl.dispose();
    descCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final CategoryCubit categoryCubit = context.read<CategoryCubit>();
    final l10n = AppLocalizations.of(context)!;

    return Scaffold(
      appBar: AppBar(title: Text(l10n.add_category)),
      body: BlocBuilder<CategoryCubit, CategoryState>(
        buildWhen: (previous, current) => previous.isSaving != current.isSaving,
        builder: (context, state) {
          return Padding(
            padding: const EdgeInsets.all(12.0),
            child: Form(
              key: formKey,
              child: Column(
                spacing: 10,
                children: [
                  Row(
                    children: [
                      SizedBox(
                        width: 150,
                        child: BlocBuilder<TxnTypeCubit, TxnTypeState>(
                          builder: (context, state) {
                            return typeDropdownField(
                              context,
                              selectedTypeId,
                              state.txnTypeList,
                              (value) {
                                if (value == null) return;
                                setState(() {
                                  selectedTypeId = value;
                                });
                              },
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: labelInputField(context, labelCtrl)),
                    ],
                  ),
                  descriptionTextArea(context, descCtrl),
                  SizedBox(
                    width: double.infinity,
                    height: 48,
                    child: Row(
                      children: [
                        Expanded(
                          flex: 1,
                          child: saveButton(
                            context,
                            true,
                            formKey,
                            categoryCubit,
                            labelCtrl,
                            descCtrl,
                            selectedTypeId,
                            widget.initialTypeId == selectedTypeId,
                          ),
                        ),
                        SizedBox(width: 12),
                        Expanded(
                          flex: 1,
                          child: saveButton(
                            context,
                            false,
                            formKey,
                            categoryCubit,
                            labelCtrl,
                            descCtrl,
                            selectedTypeId,
                            widget.initialTypeId == selectedTypeId,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

Widget typeDropdownField(
  BuildContext context,
  String value,
  List<TxnType> options,
  void Function(String? v) onChange,
) {
  final l10n = AppLocalizations.of(context)!;
  return DropdownButtonFormField2<String>(
    value: value,
    decoration: InputDecoration(
      labelText: l10n.type,
      border: OutlineInputBorder(),
    ),
    items: options.map((e) {
      return DropdownMenuItem<String>(
        value: e.id.toString(),
        child: Text(TypeLabelMap.fromBELabel(l10n, e.typeCode)),
      );
    }).toList(),
    onChanged: onChange,
    dropdownStyleData: DropdownStyleData(
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
    ),
    validator: (v) {
      final emptyErr = isEmptyValue(context, v, l10n.type);
      if (emptyErr != null) return emptyErr;
      return null;
    },
  );
}

Widget labelInputField(BuildContext context, TextEditingController controller) {
  final l10n = AppLocalizations.of(context)!;
  return TextFormField(
    controller: controller,
    decoration: InputDecoration(
      labelText: l10n.label,
      hintText: l10n.enter_field(l10n.label),
      border: OutlineInputBorder(),
    ),
    autofocus: true,
    autovalidateMode: AutovalidateMode.onUserInteraction,
    validator: (v) {
      final emptyErr = isEmptyValue(context, v, l10n.label);
      if (emptyErr != null) return emptyErr;

      final maxErr = isOverMaxLenValue(context, v, 20);
      if (maxErr != null) return maxErr;

      return null;
    },
  );
}

Widget descriptionTextArea(
  BuildContext context,
  TextEditingController controller,
) {
  final l10n = AppLocalizations.of(context)!;
  return TextFormField(
    controller: controller,
    maxLines: 4, // how tall it is
    minLines: 3, // optional
    keyboardType: TextInputType.multiline,
    decoration: InputDecoration(
      labelText: l10n.description,
      hintText: l10n.enter_field(l10n.description),
      border: OutlineInputBorder(),
      alignLabelWithHint: true, // keeps label at top
    ),
    autovalidateMode: AutovalidateMode.onUserInteraction,
    validator: (v) {
      final maxErr = isOverMaxLenValue(context, v, 100);
      if (maxErr != null) return maxErr;

      return null;
    },
  );
}

Widget saveButton(
  BuildContext context,
  bool isAddAnother,
  GlobalKey<FormState> formKey,
  CategoryCubit categoryCubit,
  TextEditingController labelCtrl,
  TextEditingController descCtrl,
  String selectedTypeId,
  bool isRefetch,
) {
  final l10n = AppLocalizations.of(context)!;
  return ElevatedButton(
    onPressed: () async {
      if (formKey.currentState!.validate()) {
        final req = AddCategoryReq(
          typeId: int.parse(selectedTypeId),
          label: labelCtrl.text.trim(),
          description: descCtrl.text.trim(),
        );

        bool isSuccess = await categoryCubit.addNewCategoryWithType(
          req,
          isRefetch,
        );

        if (!isSuccess) return;

        if (isAddAnother) {
          formKey.currentState!.reset();
        } else {
          if (context.mounted) Navigator.pop(context);
        }
      }
      return;
    },
    style: isAddAnother
        ? ButtonStyle(
            backgroundColor: WidgetStateProperty.all(AppColors.primary),
            overlayColor: WidgetStateProperty.resolveWith<Color>((states) {
              if (states.contains(WidgetState.pressed)) {
                return AppColors.onPressLightGray;
              }
              return Colors.transparent;
            }),
            shape: WidgetStateProperty.all(
              RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
            ),
          )
        : ElevatedButton.styleFrom(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(5.0),
            ),
          ),
    child: Center(
      child: Text(
        isAddAnother ? l10n.save_and_add_another : l10n.save,
        style: isAddAnother ? TextStyle(color: AppColors.white) : null,
      ),
    ),
  );
}

String? isEmptyValue(BuildContext context, String? v, String field) {
  if (v == null || v.isEmpty) {
    return AppLocalizations.of(context)!.field_required(field);
  }
  return null;
}

String? isOverMaxLenValue(BuildContext context, String? v, int max) {
  if (v != null && v.trim().length > max) {
    return AppLocalizations.of(context)!.max_length_error(max);
  }
  return null;
}
