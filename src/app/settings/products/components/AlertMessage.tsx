interface AlertMessageProps {
  type: "error" | "success";
  message: string;
}

export default function AlertMessage({ type, message }: AlertMessageProps) {
  const isError = type === "error";

  return (
    <div
      className={`p-3 border rounded-md ${
        isError
          ? "bg-red-50 border-red-200"
          : "bg-green-50 border-green-200"
      }`}
    >
      <p className={`text-sm ${isError ? "text-red-800" : "text-green-800"}`}>
        {message}
      </p>
    </div>
  );
}
