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
import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import StatusBar from "./StatusBar";

interface Employee {
  EmployeeID: string;
  full_name: string;
  DepartmentName: string;
  division: string;
  section: string;
  epc: string;
  time: string;
  readCount: number;
}

// Column definitions
const columns: Column[] = [
  { key: "EmployeeID", label: "EMPLOYEE ID" },
  { key: "epc", label: "EPC" },
  { key: "DepartmentName", label: "DEPARTMENT" },
  { key: "time", label: "TIME IN" },
  { key: "readCount", label: "READ COUNT" },
];

const socket = io("http://62.72.31.234:30725");

const PassageController = () => {
  const [logs, setLogs] = useState<Employee[]>([]);
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    let timeoutId: number | undefined;

    const resetLogs = () => {
      setLogs([]);
    };

    const handleConnect = () => {
      console.log("Connected to server");
      socket.emit("join", "in");
    };

    const handleData = (data: Employee) => {
      setLogs((prev) => {
        const updatedLogs = [...prev];
        const existingIndex = updatedLogs.findIndex(
          (log) => log.epc === data.epc
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
            time: new Date().toLocaleString(),
          });
        }
        return updatedLogs;
      });

      // Reset the timeout whenever new data is received
      clearTimeout(timeoutId);
      timeoutId = setTimeout(resetLogs, 60000); // 1 minute
    };

    socket.on("connect", handleConnect);
    socket.on("data", handleData);

    socket.on("disconnect", () => {
      console.warn("Disconnected from server");
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("data", handleData);
      socket.disconnect();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="bg-blue-50 min-h-screen ">
      <StatusBar type="ENTRY" isOnline={true} />

      {/* content */}
      <div className="p-8">
        {/* table */}
        <div className="mt-4 shadow-lg p-8 rounded-xl bg-white h-[calc(100vh-300px)] overflow-y-auto">
          <p className="font-bold text-xl text-[#003F98] flex">
            <Flame strokeWidth={3} />
            Live Data
          </p>
          {logs.length > 0 ? (
            <div className="border border-neutral-400 rounded-xl mt-4 overflow-hidden flex flex-col h-[90%]">
              {/* HEADER */}
              <div className="flex-shrink-0">
                <Table className="w-full table-fixed">
                  <TableHeader className="bg-[#F4F7FCBF]">
                    <TableRow>
                      {columns.map((item) => (
                        <TableHead
                          key={item.key}
                          className="text-lg text-left font-bold text-[#003F98] p-2"
                        >
                          {item.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                </Table>
              </div>

              <div className="flex-1 overflow-y-auto">
                <Table className="w-full table-fixed">
                  <TableBody className="text-[#003F98]">
                    {logs?.map((item, index) => (
                      <TableRow
                        key={item.epc + index}
                        className={`text-xl ${index % 2 === 0 ? "bg-white" : "bg-[#F4F7FC]"}`}
                      >
                        {columns.map((column) => {
                          const value = item[column.key as keyof Employee];
                          return (
                            <TableCell key={column.key}>{value}</TableCell>
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
