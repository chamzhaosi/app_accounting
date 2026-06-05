import { Button, ButtonProps } from "react-native-paper";

type AppButtonProps = ButtonProps;

export default function AppButton({ ...props }: AppButtonProps) {
  return (
    <Button
      mode="contained"
      contentStyle={{ marginBlock: 12, padding: 0 }}
      labelStyle={{ fontSize: 28 }}
      {...props}
    />
  );
}
