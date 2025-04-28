import { ELLIPSE_1, ELLIPSE_2, EPSON_LOGO_WHITE } from "@/assets/images";
import AlertStripe from "./AlertStripe";
import DateTimeContent from "./DateTimeContent";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  type?: "in" | "out" | "evacuation";
  isOnline?: boolean;
}

const titleHeader = {
  in: "ENTRANCE",
  out: "EXIT",
  evacuation: "EVACUATION",
};

const StatusBar = ({ type = "in", isOnline = true }: StatusBarProps) => {
  return (
    <>
      <div
        className={cn(
          "flex text-white justify-between px-8 items-center h-[103px] relative",
          type !== "evacuation" ? "bg-[#003F98] " : "bg-red-800"
        )}
      >
        <img
          src={ELLIPSE_1}
          alt="ellipse 1"
          height={"100%"}
          className="absolute top-0 left-0"
        />
        <img
          src={ELLIPSE_2}
          alt="ellipse 2"
          height={"100%"}
          className="absolute top-0 right-0"
        />
        <img src={EPSON_LOGO_WHITE} alt="Epson Logo" width={156} height={36} />
        <p className="font-extrabold text-4xl">{titleHeader[type]}</p>
        <span className="bg-[#F7FAFF] rounded-full px-4 text-black flex items-center gap-2">
          <span
            className={cn(
              "h-3 w-3 rounded-full ",
              isOnline ? "bg-green-600" : "bg-red-800"
            )}
          ></span>
          {isOnline ? "ONLINE MODE" : "OFFLINE MODE"}
        </span>
      </div>
      {type === "evacuation" ? <AlertStripe /> : <DateTimeContent />}
    </>
  );
};

export default StatusBar;
