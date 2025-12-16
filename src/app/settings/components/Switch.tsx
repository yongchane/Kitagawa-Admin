interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export default function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: SwitchProps) {
  return (
    <div className="flex items-center gap-[12px]">
      {label && (
        <label className="text-[16px] font-[600] text-[#404040]">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && onChange(!checked)}
        disabled={disabled}
        className={`relative inline-flex h-[28px] w-[52px] items-center rounded-full transition-colors duration-200 ${
          checked ? "bg-[#0089D1]" : "bg-[#D4D4D4]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`inline-block h-[22px] w-[22px] transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
            checked ? "translate-x-[26px]" : "translate-x-[3px]"
          }`}
        />
      </button>
      {label && (
        <span className="text-[14px] text-[#737373]">
          {checked ? "활성화" : "비활성화"}
        </span>
      )}
    </div>
  );
}
