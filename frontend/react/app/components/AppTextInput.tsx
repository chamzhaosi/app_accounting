import { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";

type AppTextInputProps = TextInputProps;

const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={`bg-slate-200 dark:bg-slate-300 w-[90%] pl-5 rounded-lg text-xl py-4 ${className ?? ""}`}
        {...props}
      />
    );
  },
);

AppTextInput.displayName = "AppTextInput";

export default AppTextInput;
