interface NoDataProps {
  label?: string;
}

export const NoData = ({ label }: NoDataProps) => {
  return (
    <div className="min-h-[230px] flex justify-center items-center text-[#e74c3c]">
      {label || "No results found"}
    </div>
  );
};
