import 'package:accounting/l10n/generated/app_localizations.dart';
import 'package:dropdown_button2/dropdown_button2.dart';
import 'package:flutter/material.dart';

class AccountForm extends StatefulWidget {
  const AccountForm({super.key});

  @override
  State<AccountForm> createState() => _AccountFormState();
}

class _AccountFormState extends State<AccountForm> {
  int selectedType = 0;

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context)!;
    return Scaffold(
      appBar: AppBar(title: Text('Add Account')),
      body: Padding(
        padding: const EdgeInsets.all(8.0),
        child: Column(
          spacing: 10,
          children: [
            DropdownButtonFormField2(
              value: selectedType,
              items: [
                DropdownMenuItem(value: -1, child: Text('➕ Add new')),
                DropdownMenuItem(value: 0, child: Text('Bank')),
                DropdownMenuItem(value: 1, child: Text('Cash')),
              ],
              decoration: InputDecoration(
                labelText: 'Type',
                border: OutlineInputBorder(),
              ),
              onChanged: (value) {
                setState(() {
                  selectedType = value ?? 0;
                });
              },
            ),
            if (selectedType == -1)
              TextFormField(
                // controller: controller,
                decoration: InputDecoration(
                  labelText: 'New Type',
                  hintText: l10n.enter_field(l10n.label.toLowerCase()),
                  border: OutlineInputBorder(),
                ),
                // focusNode: labelFocus,
                autovalidateMode: AutovalidateMode.onUserInteraction,
                // validator: (v) {
                //   final emptyErr = isEmptyValue(context, v, l10n.label);
                //   if (emptyErr != null) return emptyErr;

                //   final maxErr = isOverMaxLenValue(context, v, 20);
                //   if (maxErr != null) return maxErr;

                //   return null;
                // },
              ),

            TextFormField(
              // controller: controller,
              decoration: InputDecoration(
                labelText: l10n.label,
                hintText: l10n.enter_field(l10n.label.toLowerCase()),
                border: OutlineInputBorder(),
              ),
              // focusNode: labelFocus,
              autovalidateMode: AutovalidateMode.onUserInteraction,
              // validator: (v) {
              //   final emptyErr = isEmptyValue(context, v, l10n.label);
              //   if (emptyErr != null) return emptyErr;

              //   final maxErr = isOverMaxLenValue(context, v, 20);
              //   if (maxErr != null) return maxErr;

              //   return null;
              // },
            ),
            TextFormField(
              // controller: controller,
              maxLines: 4, // how tall it is
              minLines: 3, // optional
              keyboardType: TextInputType.multiline,
              decoration: InputDecoration(
                labelText: l10n.description,
                hintText: l10n.enter_field(l10n.description.toLowerCase()),
                border: OutlineInputBorder(),
                alignLabelWithHint: true, // keeps label at top
              ),
              autovalidateMode: AutovalidateMode.onUserInteraction,
              // validator: (v) {
              //   final maxErr = isOverMaxLenValue(context, v, 100);
              //   if (maxErr != null) return maxErr;

              //   return null;
              // },
            ),
            CheckboxListTile(
              title: Text('Showing in assets'),
              value: true,
              onChanged: (value) {},
              controlAffinity: ListTileControlAffinity.leading,
            ),

            SizedBox(
              width: double.infinity,
              height: 48,
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      child: Text(l10n.save_and_add_another),
                      onPressed: () {},
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: ElevatedButton(
                      child: Text(l10n.save),
                      onPressed: () {},
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
