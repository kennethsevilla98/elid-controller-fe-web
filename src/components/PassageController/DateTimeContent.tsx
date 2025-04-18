import { JP_JFLAG, PH_FLAG } from "@/assets/images";
import { useRealTimeClock } from "@/hooks/useRealTimeClock";
import { CalendarDays } from "lucide-react";

const DateTimeContent = () => {
  const today = new Date();
  const todate = `${today.toLocaleString("default", { month: "long" })} ${today.getDate()}, ${today.getFullYear()}`;

  const japanTime = useRealTimeClock("Asia/Tokyo");
  const philippinesTime = useRealTimeClock("Asia/Manila");

  return (
    <div className="flex gap-2 h-[70px] justify-between px-8 mt-8 mb-[-30px]">
      <div className=" flex items-center gap-2 w-[auto] text-white bg-[#003F98] text-3xl font-bold px-8 rounded-lg">
        <CalendarDays />
        <p>{todate}</p>
      </div>

      <div className="flex gap-4">
        <div className="flex items-center gap-8 justify-center text-white bg-[#003F98] text-3xl font-bold  rounded-lg px-8 w-96">
          <img src={PH_FLAG} alt="phil" />
          <p>{philippinesTime}</p>
        </div>
        <div className="flex items-center  justify-center gap-8  text-white bg-[#003F98] text-3xl font-bold  rounded-lg px-8  w-96">
          <img src={JP_JFLAG} alt="japan" />
          <p>{japanTime}</p>
        </div>
      </div>
    </div>
  );
};
export default DateTimeContent;
