import { NO_ENTRIES } from "@/assets/images";
import type { Column } from "@/components/ui/dynamic-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import StatusBar from "./StatusBar";
import { getIdleTimeOut, getWebSocketUrl } from "@/utils/env";

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
  full_name: `Employee John Doe a Dear ${index + 1}`,
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
const columns: Column[] = [
  { key: "employee_id", label: "ID" },
  { key: "full_name", label: "EMPLOYEE NAME" },
  { key: "section", label: "SECT." },
  { key: "time", label: "CLOCKED IN " },
];

const socketUrl = getWebSocketUrl();
const timeOut = Number(getIdleTimeOut());

const PassageController = () => {
  const [logs, setLogs] = useState<Employee[]>(mockEmployees);
  const [passageType, setPassageType] = useState<PassageType>("controller_in");

  useEffect(() => {
    const socket = io(socketUrl, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    let timeoutId: number | undefined;
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

          // remove the newly added data after 10 seconds
          setTimeout(() => {
            setLogs((currentLogs) =>
              currentLogs.filter((log) => log.employee_id !== data.employee_id)
            );
          }, timeOut);
        }
        return updatedLogs;
      });
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
      clearTimeout(timeoutId);
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
                      {columns.map((item, index) => (
                        <TableHead
                          key={item.key}
                          className={`text-lg text-left font-bold text-[#003F98] p-2 border-l min-w-fit whitespace-nowrap ${
                            index === columns.length - 1 ? "text-right" : ""
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
                        className={`text-xl ${index % 2 === 0 ? "bg-white" : "bg-[#F4F7FC]"}`}
                      >
                        {columns.map((column, colIndex) => {
                          const value = item[column.key as keyof Employee];
                          return (
                            <TableCell
                              key={column.key}
                              className={`border-l min-w-fit whitespace-nowrap ${
                                colIndex === columns.length - 1
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
