import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Modal, Portal, Text } from "react-native-paper";
import AppButton, {
  ButtonType,
  SUBMIT_BTN_CONTENT_STYLE,
} from "../../../components/AppButton";
import { useTranslation } from "../../../i18n/helper";
import type { BeneficiaryRspType } from "../../../sql/types/beneficiaryType";
import { useThemeStore } from "../../../stores/useThemeStore";
import BeneficiarySelector from "./BeneficiarySelector";

type Props = {
  visible: boolean;
  beneficiaries: BeneficiaryRspType[];
  selectedIds: string[];
  onApply: (ids: string[]) => void;
  onDismiss: () => void;
};

export default function BeneficiaryFilterModal({
  visible,
  beneficiaries,
  selectedIds,
  onApply,
  onDismiss,
}: Props) {
  const { THEME } = useThemeStore();
  const { t } = useTranslation();
  const [draft, setDraft] = useState(selectedIds);
  useEffect(() => {
    if (visible) setDraft(selectedIds);
  }, [selectedIds, visible]);
  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.sheet,
          { backgroundColor: THEME.surfaceContainer },
        ]}
      >
        <Text variant="headlineSmall" style={styles.title}>
          {t("Filters")}
        </Text>
        <BeneficiarySelector
          label="Beneficiary"
          beneficiaries={beneficiaries}
          selectedIds={draft}
          multiple
          allowInactiveSelection
          headerLayout="category"
          presentation="modal"
          onChange={setDraft}
        />
        <View style={styles.actions}>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            variant={ButtonType.SECONDARY}
            style={styles.button}
            onPress={() => setDraft([])}
          >
            Reset Filters
          </AppButton>
          <AppButton
            {...SUBMIT_BTN_CONTENT_STYLE}
            style={styles.button}
            onPress={() => {
              onApply(draft);
              onDismiss();
            }}
          >
            Apply Filters
          </AppButton>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: "row", gap: 12 },
  button: { flex: 1, borderRadius: 8 },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    bottom: 0,
    left: 0,
    padding: 20,
    position: "absolute",
    right: 0,
  },
  title: { marginBottom: 16 },
});
