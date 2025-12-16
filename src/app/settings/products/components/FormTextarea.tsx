interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  height?: string;
}

export default function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  height = "175px",
}: FormTextareaProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-[16px] font-[600] text-[#404040]">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        style={{ height }}
        className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] focus:outline-none focus:border-[#0089D1] resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
        placeholder={placeholder}
      />
    </div>
  );
}
