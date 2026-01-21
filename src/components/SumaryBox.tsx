import React from "react";
import type { SvgIconComponent } from "@mui/icons-material";

interface SummaryBoxProps {
  title: string;
  value: string | number;
  percentageChange: string | number;
  icon: SvgIconComponent;
  iconColor: string;
  percentageChangeColor: string;
}

const SummaryBox = ({
  title,
  value,
  percentageChange,
  icon: Icon,
  iconColor,
  percentageChangeColor,
}: SummaryBoxProps) => {
  return (
    <div className="min-w-[250px] w-full lg:w-[250px] rounded-md border p-4 bg-white dark:bg-[#484554] dark:border-none">
      <h3 className="text-sm text-[#64748b] dark:text-white">
        {title}
      </h3>

      <div className="mt-1 flex items-center gap-2">
        <p className="text-lg lg:text-2xl font-semibold text-[#334155] dark:text-white">
          {value}
        </p>

        <span
          className={`flex items-center gap-1 text-xs font-semibold ${percentageChangeColor}`}
        >
          <Icon className={`text-xs ${iconColor}`} />
          <span>{percentageChange}%</span>
        </span>
      </div>
    </div>
  );
};

export default SummaryBox;
