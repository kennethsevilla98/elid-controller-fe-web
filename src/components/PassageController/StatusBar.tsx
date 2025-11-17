import { ELLIPSE_1, ELLIPSE_2, EPSON_LOGO_WHITE } from "@/assets/images";
import AlertStripe from "./AlertStripe";
import DateTimeContent from "./DateTimeContent";
import { cn } from "@/lib/utils";

interface StatusBarProps {
  type?:
    | "controller_in"
    | "controller_out"
    | "controller_safe"
    | "controller_home";
  isOnline?: boolean;
  dateTime?: string;
}

const titleHeader = {
  controller_in: "ENTRANCE",
  controller_out: "EXIT",
  controller_safe: "EVACUATION",
  controller_home: "HOME",
};

const StatusBar = ({
  type = "controller_in",
  isOnline = false,
  dateTime,
}: StatusBarProps) => {
  return (
    <>
      <div
        className={cn(
          "flex text-white justify-between px-8 items-center h-[103px] relative",
          type !== "controller_safe" ? "bg-[#003F98] " : "bg-red-800"
        )}
      >
        {!isOnline && (
          <>
            <style>{`
              @keyframes totalFade {
                0% { opacity: 1; }
                50% { opacity: 0; }
                100% { opacity: 1; }
              }
            `}</style>

            <div
              className="h-12 w-3/4 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 px-3 py-1 rounded flex items-center justify-center"
              style={{ animation: "totalFade 2.5s ease-in-out infinite" }}
            >
              <p className="text-xl font-bold">OFFLINE MODE</p>
            </div>
          </>
        )}
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
        <span className="bg-[#F7FAFF] rounded-full px-2 text-black flex items-center gap-2">
          <span
            className={cn(
              "h-4 w-4 rounded-full ",
              isOnline ? "bg-green-600" : "bg-red-800"
            )}
          ></span>
          {isOnline ? "ONLINE MODE" : "OFFLINE MODE"}
        </span>
      </div>
      {type === "controller_safe" ? (
        <AlertStripe />
      ) : (
        <DateTimeContent dateTime={dateTime} />
      )}
    </>
  );
};

export default StatusBar;
