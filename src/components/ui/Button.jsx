import { buttonClasses } from "./buttonStyles";

export default function Button({
  variant = "solid",
  className = "",
  type = "button",
  ...props
}) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, className)}
      {...props}
    />
  );
}
