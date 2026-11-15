export default function Container({
  as: Tag = "div",
  className = "",
  children,
  ...props
}) {
  return (
    <Tag
      className={`mx-auto w-full max-w-[88rem] px-5 sm:px-8 lg:px-12 ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
