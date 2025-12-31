interface SubmitButtonProps {
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export default function SubmitButton({
  onClick,
  disabled = false,
  children,
}: SubmitButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-[392px] px-[32px] py-[12px] rounded-[9999px] text-[14px] font-[600] transition-colors ${
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-[#0089D1] text-white hover:bg-[#0077B8]"
      }`}
    >
      {children}
    </button>
  );
}
