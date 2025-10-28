const DateTimeContent = ({ dateTime }: { dateTime?: string }) => {
  // const today = new Date();
  // const todate = `${today.toLocaleString("default", { month: "long" })} ${today.getDate()}, ${today.getFullYear()}`;

  // // const japanTime = useRealTimeClock("Asia/Tokyo");
  // const philippinesTime = useRealTimeClock("Asia/Manila");

  const parts = dateTime?.split(", ");

  const date = dateTime ? `${parts?.[1]}, ${parts?.[2]}` : ""; // "Oct 28, 2025"
  const time = parts?.[3];
  return (
    <div className="flex gap-8 h-[70px] justify-between px-8 mt-8 mb-[-30px]">
      <div className=" flex justify-between items-center gap-2 w-full text-white bg-[#003F98] px-8 text-4xl font-bold  rounded-lg">
        {/* <CalendarDays /> */}
        <p>{date}</p>
        <p>{time}</p>
      </div>
    </div>
  );
};
export default DateTimeContent;
