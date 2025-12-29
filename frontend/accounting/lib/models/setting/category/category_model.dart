class Category {
  final String type;
  final String label;
  final String? description;

  Category({required this.label, required this.type, this.description});

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      label: json['label'],
      type: json['type'],
      description: json['description'],
    );
  }

  Map<String, dynamic> toJson() => {
    'label': label,
    'type': type,
    'description': description,
  };
}

class AddCategoryReq {
  final int typeId;
  final String label;
  final String? description;

  AddCategoryReq({required this.typeId, required this.label, this.description});

  Map<String, dynamic> toJson() => {
    'typeId': typeId,
    'label': label,
    'description': description,
  };
}
