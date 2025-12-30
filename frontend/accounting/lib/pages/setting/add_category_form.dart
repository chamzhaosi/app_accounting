import 'package:accounting/cubits/setting/category/category_cubit.dart';
import 'package:accounting/cubits/setting/category/category_state.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_cubit.dart';
import 'package:accounting/cubits/setting/txn_type/txn_type_state.dart';
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
  Widget build(BuildContext context) {
    final formKey = GlobalKey<FormState>();
    final CategoryCubit categoryCubit = context.read<CategoryCubit>();

    return Scaffold(
      appBar: AppBar(title: Text('Add Category')),
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
                      Expanded(child: labelInputField(labelCtrl)),
                    ],
                  ),
                  descriptionTextArea(descCtrl),
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
  String value,
  List<TxnType> options,
  void Function(String? v) onChange,
) {
  return DropdownButtonFormField2<String>(
    value: value,
    decoration: const InputDecoration(
      labelText: 'Type',
      border: OutlineInputBorder(),
    ),
    items: options.map((e) {
      return DropdownMenuItem<String>(
        value: e.id.toString(),
        child: Text(e.displayName),
      );
    }).toList(),
    onChanged: onChange,
    dropdownStyleData: DropdownStyleData(
      decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
    ),
    validator: (v) {
      if (v == null || v.isEmpty) return 'Type required';
      return null;
    },
  );
}

Widget labelInputField(TextEditingController controller) => TextFormField(
  controller: controller,
  decoration: InputDecoration(
    labelText: 'Label',
    hintText: 'Please enter label',
    border: OutlineInputBorder(),
  ),
  autofocus: true,
  autovalidateMode: AutovalidateMode.onUserInteraction,
  validator: (v) {
    final emptyErr = isEmptyValue(v);
    if (emptyErr != null) return emptyErr;

    final maxErr = isOverMaxLenValue(v, 20);
    if (maxErr != null) return maxErr;

    return null;
  },
);

Widget descriptionTextArea(TextEditingController controller) => TextFormField(
  controller: controller,
  maxLines: 4, // how tall it is
  minLines: 3, // optional
  keyboardType: TextInputType.multiline,
  decoration: const InputDecoration(
    labelText: 'Description',
    hintText: 'Please enter description',
    border: OutlineInputBorder(),
    alignLabelWithHint: true, // keeps label at top
  ),
  autovalidateMode: AutovalidateMode.onUserInteraction,
  validator: (v) {
    final emptyErr = isEmptyValue(v);
    if (emptyErr != null) return emptyErr;

    final maxErr = isOverMaxLenValue(v, 100);
    if (maxErr != null) return maxErr;

    return null;
  },
);

Widget saveButton(
  BuildContext context,
  bool isAddAnother,
  GlobalKey<FormState> formKey,
  CategoryCubit categoryCubit,
  TextEditingController labelCtrl,
  TextEditingController descCtrl,
  String selectedTypeId,
  bool isRefetch,
) => ElevatedButton(
  onPressed: () async {
    if (formKey.currentState!.validate()) {
      final req = AddCategoryReq(
        typeId: int.parse(selectedTypeId),
        label: labelCtrl.text.trim(),
        description: descCtrl.text.trim(),
      );

      await categoryCubit.addNewCategoryWithType(req, isRefetch);

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
      isAddAnother ? 'Save & Add Another' : 'Save',
      style: isAddAnother ? TextStyle(color: AppColors.white) : null,
    ),
  ),
);

String? isEmptyValue(String? v) {
  if (v == null || v.isEmpty) return 'Description required';
  return null;
}

String? isOverMaxLenValue(String? v, int max) {
  if (v != null && v.trim().length > max) {
    return 'Maximum length is $max characters';
  }
  return null;
}
