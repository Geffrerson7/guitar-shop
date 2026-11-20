import type { ComponentPropsWithoutRef } from "react";
import { buttonClasses, type ButtonVariant } from "./buttonStyles";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
};

export default function Button({
  variant = "solid",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      {...props}
    />
  );
}
