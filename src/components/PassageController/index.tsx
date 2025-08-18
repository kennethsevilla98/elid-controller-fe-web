import { NO_ENTRIES } from "@/assets/images";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import StatusBar from "./StatusBar";
import { getBeepDuration, getIdleTimeOut, getWebSocketUrl } from "@/utils/env";
import { cn } from "@/lib/utils";
import useBeep from "@/hooks/useBeep";

interface Employee {
  EmployeeID: string;
  full_name: string;
  DepartmentName: string;
  division: string;
  section: string;
  epc: string;
  time: string;
  readCount: number;
  tag_id?: string | number;
  employee_id?: string;
  department?: string;
}

// // Mock data
// const mockEmployees: Employee[] = Array.from({ length: 50 }, (_, index) => ({
//   EmployeeID: `E${String(index + 1).padStart(3, "0")}`,
//   full_name:
//     index === 1
//       ? "UNKNOWN"
//       : `Employee John Doe a  asdfasdfasdfasdfasdfasdfasd Dear ${index + 1}`,
//   DepartmentName: `Department ${(index % 10) + 1}`,
//   division: `Division ${(index % 5) + 1}`,
//   section: `Section ${(index % 3) + 1}`,
//   epc: `EPC${index + 1}`,
//   time: `10:${String(index % 60).padStart(2, "0")}`,
//   readCount: 1,
//   tag_id: `TAG${index + 1}`,
//   employee_id: `E${String(index + 1).padStart(3, "0")}`,
//   department: `Department ${(index % 10) + 1}`,
// }));

type PassageType = "controller_in" | "controller_out" | "controller_evacuation";

const passageTypeMapping: Record<string, PassageType> = {
  In: "controller_in",
  Out: "controller_out",
  Evacuation: "controller_evacuation",
};

// Column definitions
const columns = (type: PassageType) => {
  return [
    { key: "full_name", label: "EMPLOYEE NAME" },
    { key: "section", label: "SECTION" },
    { key: "time", label: type === "controller_out" ? "TIME OUT" : "TIME IN" },
  ];
};

const socketUrl = getWebSocketUrl();
const timeOut = Number(getIdleTimeOut());
const beepTimeout = Number(getBeepDuration());

const PassageController = () => {
  const [logs, setLogs] = useState<Employee[]>([]);
  const [passageType, setPassageType] = useState<PassageType>("controller_in");

  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const { pattern } = useBeep();

  const playBeepPattern = () => {
    const steps = [];
    const beepDuration = 200;
    const gapDuration = 200;
    const totalTime = beepTimeout;
    const repeatCount = Math.floor(totalTime / (beepDuration + gapDuration));

    for (let i = 0; i < repeatCount; i++) {
      steps.push({ frequency: 880, duration: beepDuration, volume: 100 });
      steps.push({ gap: gapDuration });
    }

    pattern(steps); // will automatically stop any previous one
  };

  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    const joinedRooms = new Set();

    const handleData = (data: Employee) => {
      console.log("Received data:", data);

      if (data.full_name.toUpperCase() === "UNKNOWN") {
        playBeepPattern();
      }

      setLogs((prev) => {
        const updatedLogs = [...prev];
        const existingIndex = updatedLogs.findIndex(
          (log) => log.tag_id === data.tag_id
        );

        if (existingIndex !== -1) {
          updatedLogs[existingIndex] = {
            ...updatedLogs[existingIndex],
            readCount: updatedLogs[existingIndex]?.readCount + 1,
          };
        } else {
          updatedLogs.unshift({
            ...data,
            full_name: truncateName(data.full_name),
            readCount: 1,
          });
        }
        return updatedLogs;
      });

      // Reset the timer each time a tag is read
      if (timeoutsRef.current[data.tag_id as any]) {
        clearTimeout(timeoutsRef.current[data.tag_id as any]);
      }

      timeoutsRef.current[data.tag_id as any] = setTimeout(() => {
        setLogs((currentLogs) =>
          currentLogs.filter((log) => log.tag_id !== data.tag_id)
        );
        delete timeoutsRef.current[data.tag_id as any];
        console.log(`Removed ${data.tag_id} after inactivity`);
      }, timeOut);
    };

    const handleConnect = () => {
      console.log("Connected to server");
      socket.emit("join", "check_device");
    };

    socket.on("connect", handleConnect);

    socket.on("device_detail", (type) => {
      console.log(`Device type: ${type}`);

      if (!joinedRooms.has(type)) {
        socket.emit("join", passageTypeMapping[type]);
        joinedRooms.add(type);
        setPassageType(passageTypeMapping[type]);
      } else {
        console.log(`Already joined room: ${type}, skipping`);
      }
    });

    socket.on("data", handleData);

    socket.on("disconnect", () => {
      console.warn("Disconnected from server");
    });

    const handleConnectError = (error: Error) => {
      console.error("Connection error: ", error);
      if (
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ENOTFOUND")
      ) {
        console.error(
          "The server IP might be incorrect or the server is unavailable."
        );
      }
    };

    socket.on("connect_error", handleConnectError);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("data", handleData);
      socket.off("connect_error", handleConnectError);
      socket.disconnect();
      Object.values(timeoutsRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="bg-blue-50 min-h-screen overflow-hidden">
      <StatusBar type={passageType} />

      {/* content */}
      <div className="p-8">
        {/* table */}
        <div className="mt-4 shadow-lg p-8 rounded-xl bg-white h-[calc(100vh-300px)] overflow-x-auto overflow-y-auto">
          {logs.length > 0 ? (
            <div className="border rounded-xl mt-4 overflow-hidden flex flex-col h-[96%] max-w-full">
              {/* Removed inner scroll wrapper to preserve sticky header */}
              <Table className="w-full table-auto border min-w-[600px] md:min-w-full responsive-table">
                <TableHeader className="bg-[#F4F7FC] sticky top-0 z-10 op">
                  <TableRow>
                    {columns(passageType).map((item, index) => (
                      <TableHead
                        key={item.key}
                        className={`text-[2.5vw] md:text-3xl lg:text-[45px] lg:leading-tight text-left font-bold text-[#003F98] p-2 border-l min-w-fit whitespace-normal ${
                          index === columns(passageType).length - 1
                            ? "text-right whitespace-nowrap"
                            : index === columns(passageType).length - 2
                              ? "whitespace-nowrap"
                              : ""
                        }`}
                      >
                        {item.label}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody className="text-[#003F98]">
                  {logs.map((item, index) => (
                    <TableRow
                      key={item.epc + index}
                      className={cn(
                        `text-2xl md:text-3xl lg:text-[45px] lg:leading-tight ${
                          index % 2 === 0 ? "bg-[#D9EBF6]" : "bg-[#FFFF06]"
                        }`,
                        item.full_name.toUpperCase() === "UNKNOWN"
                          ? "text-red-500"
                          : ""
                      )}
                    >
                      {columns(passageType).map((column, colIndex) => {
                        const value = item[column.key as keyof Employee];
                        return (
                          <TableCell
                            key={column.key}
                            className={`border-l min-w-fit font-semibold
                                  ${
                                    colIndex === 0
                                      ? "whitespace-nowrap overflow-hidden text-ellipsis max-w-[21ch]"
                                      : "whitespace-normal"
                                  }
                                  ${
                                    colIndex === columns(passageType).length - 1
                                      ? "text-right whitespace-nowrap"
                                      : ""
                                  }
                                `}
                          >
                            {value}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center flex-col gap-4">
              <img src={NO_ENTRIES} alt="No entries" />
              <p className="text-xl">No entries detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassageController;

function truncateName(name: string) {
  return name.length > 18 ? name.slice(0, 18) + "…" : name;
}
