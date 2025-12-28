import 'package:accounting/theme/app_colors.dart';
import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:flutter/material.dart';

class AddCategoryForm extends StatelessWidget {
  const AddCategoryForm({super.key});

  @override
  Widget build(BuildContext context) {
    final formKey = GlobalKey<FormState>();

    return Scaffold(
      appBar: AppBar(title: Text('Add Category')),
      body: Padding(
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
                    child: typeDropdownField('INCOME', (value) {}),
                  ),
                  const SizedBox(width: 12),
                  Expanded(child: labelInputField()),
                ],
              ),
              descriptionTextArea(),
              SizedBox(
                width: double.infinity,
                height: 48,
                child: Row(
                  children: [
                    Expanded(flex: 1, child: saveAndAddAnotherButton(formKey)),
                    SizedBox(width: 12),
                    Expanded(flex: 1, child: saveButton(formKey)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

Widget typeDropdownField(String value, void Function(String? v) onChange) =>
    DropdownButtonFormField2<String>(
      value: value,
      decoration: const InputDecoration(
        labelText: 'Type',
        border: OutlineInputBorder(),
      ),
      items: const [
        DropdownMenuItem(value: 'INCOME', child: Text('Income')),
        DropdownMenuItem(value: 'EXPENSE', child: Text('Expense')),
      ],
      onChanged: (value) => onChange,
      dropdownStyleData: DropdownStyleData(
        direction: DropdownDirection.left,
        decoration: BoxDecoration(borderRadius: BorderRadius.circular(12)),
      ),
      validator: (v) {
        if (v == null || v.isEmpty) return 'Type required';
        return null;
      },
    );

Widget labelInputField() => TextFormField(
  decoration: InputDecoration(
    labelText: 'Label',
    hintText: 'Please enter label',
    border: OutlineInputBorder(),
  ),
  autofocus: true,
  autovalidateMode: AutovalidateMode.onUserInteraction,
  validator: (v) {
    if (v == null || v.isEmpty) return 'Label required';
    return null;
  },
);

Widget descriptionTextArea() => TextFormField(
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
    if (v == null || v.isEmpty) return 'Description required';
    return null;
  },
);

Widget saveAndAddAnotherButton(GlobalKey<FormState> formKey) => ElevatedButton(
  onPressed: () {
    if (formKey.currentState!.validate()) {
      //Submit
    }
    return;
  },
  style: ButtonStyle(
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
  ),
  child: Center(
    child: Text('Save & Add Another', style: TextStyle(color: AppColors.white)),
  ),
);

Widget saveButton(GlobalKey<FormState> formKey) => ElevatedButton(
  onPressed: () {
    if (formKey.currentState!.validate()) {
      //Submit
    }
    return;
  },
  style: ElevatedButton.styleFrom(
    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5.0)),
  ),
  child: Center(child: Text('Save')),
);
