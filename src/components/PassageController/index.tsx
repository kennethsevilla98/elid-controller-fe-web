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
  employee_id: string;
  full_name: string;
  department: string;
  time: string;
  tag_id: string;
  readCount: number;
}

const PassageController = () => {
  const [logs, setLogs] = useState<Employee[]>([]);

  const socket = io("http://localhost:3000");

  useEffect(() => {
    socket.connect();

    const handleConnect = () => {
      console.log("Connected to server");
      socket.emit("join", "1234");
    };

    socket.on("connect", handleConnect);

    socket.on("data", (data) => {
      console.log("Received data:", data);
      setLogs((prev) => {
        const updatedLogs = [...prev];
        const existingIndex = updatedLogs.findIndex(
          (log) => log.employee_id === data.employee_id
        );

        if (existingIndex !== -1) {
          updatedLogs[existingIndex] = {
            ...updatedLogs[existingIndex],
            readCount: updatedLogs[existingIndex]?.readCount + 1,
            time: data.time,
          };
        } else {
          updatedLogs.unshift({ ...data, readCount: 1 });

          // remove the newly added data after 10 seconds
          setTimeout(() => {
            setLogs((currentLogs) =>
              currentLogs.filter((log) => log.employee_id !== data.employee_id)
            );
          }, 10000);
        }
        return updatedLogs.sort((a, b) => {
          const timeA = new Date(a.time).getTime();
          const timeB = new Date(b.time).getTime();
          return timeB - timeA; // Sort in descending order
        });
      });
    });

    socket.on("disconnect", () => {
      console.warn("Disconnected from server");
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("data");
      socket.disconnect();
    };
  }, []);

  // Column definitions
  const columns: Column[] = [
    { key: "employee_id", label: "EMPLOYEE ID" },
    { key: "full_name", label: "EMPLOYEE NAME" },
    { key: "department", label: "DEPARTMENT" },
    { key: "time", label: "TIME IN" },
    { key: "readCount", label: "READ COUNT" },
  ];

  return (
    <div className="bg-blue-50 min-h-screen ">
      <StatusBar type="EVACUATION" isOnline={true} />

      {/* content */}
      <div className="p-8">
        {/* table */}
        <div className="mt-4 shadow-lg p-8 rounded-xl bg-white h-[calc(100vh-300px)] overflow-y-auto">
          <p className="font-bold text-xl text-[#003F98] flex">
            <Flame strokeWidth={3} />
            Live Data
          </p>
          {logs.length > 0 ? (
            <div className="border-solid border border-neutral-400 rounded-xl mt-4">
              <div className="overflow-x-auto max-h-[10000px]">
                <Table className="min-w-full  z-0">
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
                  <TableBody>
                    {logs?.map((item, index) => (
                      <TableRow
                        key={item.employee_id + index}
                        className={`text-xl text-[#003F98] ${
                          index % 2 === 0 ? "bg-white" : "bg-[#F4F7FC]"
                        } ${
                          index === logs.length - 1
                            ? "rounded-bl-xl rounded-br-xl"
                            : ""
                        }`}
                      >
                        <TableCell>{item.employee_id}</TableCell>
                        <TableCell>{item.full_name}</TableCell>
                        <TableCell>{item.department}</TableCell>
                        <TableCell>{item.time}</TableCell>
                        <TableCell className="text-end">
                          {item.readCount}
                        </TableCell>
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
