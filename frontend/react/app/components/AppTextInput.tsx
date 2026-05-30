import { forwardRef } from "react";
import { TextInput, TextInputProps } from "react-native";
import { cn } from "../utils/common";

type AppTextInputProps = TextInputProps;

const AppTextInput = forwardRef<TextInput, AppTextInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          "bg-lightBgAccent dark:bg-slate-300 w-[90%] pl-5 rounded-lg text-xl py-4 font-robotoMono font-[400]",
          className,
        )}
        {...props}
      />
    );
  },
);

AppTextInput.displayName = "AppTextInput";

export default AppTextInput;
