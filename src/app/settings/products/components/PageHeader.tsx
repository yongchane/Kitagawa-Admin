interface PageHeaderProps {
  title: string;
  subtitle?: string;
  titleColor?: string;
}

export default function PageHeader({
  title,
  subtitle,
  titleColor = "#171717",
}: PageHeaderProps) {
  return (
    <div className="flex items-center gap-[12px]">
      <h2 className="text-[24px] font-[700]" style={{ color: titleColor }}>
        {title}
      </h2>
      {subtitle && (
        <span className="text-[14px] font-[500] text-[#737373]">
          {subtitle}
        </span>
      )}
    </div>
  );
}
