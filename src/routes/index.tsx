import {
  ELLIPSE_1,
  ELLIPSE_2,
  EPSON_LOGO_WHITE,
  JP_JFLAG,
  PH_FLAG,
} from "@/assets/images";
import type { Column } from "@/components/ui/dynamic-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Flame } from "lucide-react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  const today = new Date();

  const todate = `${today.toLocaleString("default", { month: "long" })} ${today.getDate()}, ${today.getFullYear()}`;

  const [japanTime, setJapanTime] = useState("");
  const [philippinesTime, setPhilippinesTime] = useState("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formatTime = (date: Date) =>
        date
          .toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
          })
          .toUpperCase();

      const japanTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" })
      );
      const philippinesTime = new Date(
        now.toLocaleString("en-US", { timeZone: "Asia/Manila" })
      );

      setJapanTime(formatTime(japanTime));
      setPhilippinesTime(formatTime(philippinesTime));
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  // Column definitions
  const columns: Column[] = [
    { key: "employeeId", label: "EMPLOYEE NAME" },
    { key: "employeeName", label: "EMPLOYEE NAME" },
    { key: "department", label: "DEPARTMENT" },
    { key: "timeIn", label: "TIME IN" },
    { key: "readCount", label: "READ COUNT" },
  ];

  return (
    <div className="bg-blue-50 ">
      {/* Status bar */}
      <div className="bg-[#003F98] flex text-white justify-between px-8 items-center h-[103px] relative">
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
        <p className="font-extrabold text-4xl">ENTRANCE</p>
        <span className="bg-[#F7FAFF] rounded-full px-4 text-black flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-600"></span>
          ONLINE MODE
        </span>
      </div>

      {/* content */}
      <div className="p-8">
        <div className="flex gap-2  h-[70px] justify-between">
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

        {/* table */}
        <div className="mt-4 shadow-lg p-8 rounded-xl bg-white">
          <p className="font-bold text-xl text-[#003F98] flex">
            <Flame strokeWidth={3} />
            Live Data
          </p>
          <div className="border-solid border border-neutral-400 rounded-xl mt-4">
            <div className="overflow-x-auto max-h-[10000px]">
              <Table className="min-w-full  z-0">
                {/* Table Header */}
                <TableHeader>
                  <TableRow className="bg-[#F4F7FCBF] ">
                    {columns.map((item, index) => (
                      <TableHead
                        key={item.key}
                        className={`text-lg font-bold text-[#003F98] sticky top-0 z-10 ${
                          index === 0
                            ? "rounded-tl-xl "
                            : index === columns.length - 1
                              ? "rounded-tr-xl"
                              : ""
                        }`}
                      >
                        {item.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody>
                  {SAMPLE_DATA.map((item, index) => (
                    <TableRow
                      key={item.employeeId}
                      className={`text-xl text-[#003F98] ${
                        index % 2 === 0 ? "bg-white" : "bg-[#F4F7FC]"
                      } ${
                        index === SAMPLE_DATA.length - 1
                          ? "rounded-bl-xl rounded-br-xl"
                          : ""
                      }`}
                    >
                      <TableCell>{item.employeeId}</TableCell>
                      <TableCell>{item.employeeName}</TableCell>
                      <TableCell>{item.department}</TableCell>
                      <TableCell>{item.timeIn}</TableCell>
                      <TableCell className="text-end">
                        {item.readCount}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface User {
  employeeId: number;
  employeeName: string;
  department: string;
  timeIn: string;
  readCount: number;
}

const SAMPLE_DATA: User[] = Array.from({ length: 20 }, (_, index) => ({
  employeeId: index + 1,
  employeeName: `Employee ${index + 1}`,
  department: index % 2 === 0 ? "IT" : "Design",
  timeIn: `${8 + Math.floor(index / 2)}:${index % 2 === 0 ? "00" : "30"} AM`,
  readCount: Math.floor(Math.random() * 10) + 1,
}));
