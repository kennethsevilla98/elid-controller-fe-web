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
import { getIdleTimeOut, getWebSocketUrl } from "@/utils/env";
import { cn } from "@/lib/utils";

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

// Mock data
const mockEmployees: Employee[] = Array.from({ length: 20 }, (_, index) => ({
  EmployeeID: `E${String(index + 1).padStart(3, "0")}`,
  full_name: index === 1 ? "UNKNOWN" : `Employee John Doe a Dear ${index + 1}`,
  DepartmentName: `Department ${(index % 10) + 1}`,
  division: `Division ${(index % 5) + 1}`,
  section: `Section ${(index % 3) + 1}`,
  epc: `EPC${index + 1}`,
  time: `10:${String(index % 60).padStart(2, "0")}`,
  readCount: 1,
  tag_id: `TAG${index + 1}`,
  employee_id: `E${String(index + 1).padStart(3, "0")}`,
  department: `Department ${(index % 10) + 1}`,
}));

type PassageType = "controller_in" | "controller_out" | "controller_evacuation";

const passageTypeMapping: Record<string, PassageType> = {
  In: "controller_in",
  Out: "controller_out",
  Evacuation: "controller_evacuation",
};

// Column definitions
const columns = (type: PassageType) => {
  return [
    { key: "employee_id", label: "ID" },
    { key: "full_name", label: "EMPLOYEE NAME" },
    { key: "section", label: "SECT." },
    { key: "time", label: type === "controller_out" ? "OUTGOING" : "INCOMING" },
  ];
};

const socketUrl = getWebSocketUrl();
const timeOut = Number(getIdleTimeOut());

const PassageController = () => {
  const [logs, setLogs] = useState<Employee[]>([]);
  const [passageType, setPassageType] = useState<PassageType>("controller_in");

  const timeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

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
        <div className="mt-4 shadow-lg p-8 rounded-xl bg-white h-[calc(100vh-300px)] overflow-y-auto">
          {logs.length > 0 ? (
            <div className=" border rounded-xl mt-4 overflow-hidden flex flex-col h-[96%]">
              <div className="flex-1 overflow-y-auto">
                <Table className="w-full table-auto border">
                  <TableHeader className="bg-[#F4F7FCBF] sticky top-0 z-10">
                    <TableRow>
                      {columns(passageType).map((item, index) => (
                        <TableHead
                          key={item.key}
                          className={`text-3xl text-left font-bold text-[#003F98] p-2 border-l min-w-fit whitespace-nowrap ${
                            index === columns(passageType).length - 1
                              ? "text-right"
                              : ""
                          }`}
                        >
                          {item.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>

                  <TableBody className="text-[#003F98]">
                    {logs?.map((item, index) => (
                      <TableRow
                        key={item.epc + index}
                        className={cn(
                          `text-xl, ${index % 2 === 0 ? "bg-[#D9EBF6]" : "bg-[#FFFF06]"}`,
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
                              className={`border-l min-w-fit whitespace-nowrap text-3xl font-semibold ${
                                colIndex === columns(passageType).length - 1
                                  ? "text-right"
                                  : ""
                              }`}
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
            </div>
          ) : (
            <div className="h-full w-full flex items-center justify-center flex-col gap-4">
              <img src={NO_ENTRIES} alt="No enties" />
              <p className="text-xl">No entries detected.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassageController;
