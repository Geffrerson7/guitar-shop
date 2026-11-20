import type { ElementType, HTMLAttributes, ReactNode } from "react";

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  children?: ReactNode;
};

export default function Container({
  as: Tag = "div",
  className = "",
  children,
  ...props
}: ContainerProps) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
