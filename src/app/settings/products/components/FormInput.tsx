interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function FormInput({
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-[8px]">
      <label className="text-[16px] font-[600] text-[#404040]">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full px-[16px] py-[12px] border border-[#D4D4D4] rounded-[8px] text-[14px] text-[#171717] bg-white focus:outline-none focus:border-[#0089D1] disabled:bg-gray-100 disabled:cursor-not-allowed placeholder:text-[#A3A3A3]"
        placeholder={placeholder}
      />
    </div>
  );
}
