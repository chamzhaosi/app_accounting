class Category {
  final int? id;
  final String typeId;
  final String label;
  final String? description;
  final bool active;

  Category({
    required this.id,
    required this.label,
    required this.typeId,
    this.description,
    required this.active,
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id'],
      label: json['label'],
      typeId: json['typeId'],
      description: json['description'],
      active: json['active'],
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'label': label,
    'typeId': typeId,
    'description': description,
    'active': active,
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

class UpdCategoryReg extends AddCategoryReq {
  final int id;
  final bool isActive;

  UpdCategoryReg({
    required this.id,
    required super.typeId,
    required super.label,
    super.description,
    required this.isActive,
  });

  @override
  Map<String, dynamic> toJson() => {
    'id': id,
    'typeId': typeId,
    'label': label,
    'description': description,
    'isActive': isActive,
  };
}
