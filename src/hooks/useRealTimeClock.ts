import { useEffect, useState } from "react";

export const useRealTimeClock = (timeZone: string | undefined) => {
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      const formatTime = (date: Date) =>
        date.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        });

      const newTime = new Date(now.toLocaleString("en-US", { timeZone }));

      setTime(formatTime(newTime));
    };

    updateTime();

    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return time;
};
