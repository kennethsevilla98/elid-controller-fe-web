import { getHostAppURL } from "@/utils/env";
import { useEffect, useState } from "react";

const HOST_URL = getHostAppURL();
export function useLANStatus(intervalMs = 5000) {
  const [isConnectedToLAN, setIsConnectedToLAN] = useState(false);

  useEffect(() => {
    let intervalId: number;

    const checkLAN = async () => {
      try {
        await fetch(HOST_URL, {
          method: "GET",
          mode: "no-cors",
        });

        setIsConnectedToLAN(true);
      } catch {
        setIsConnectedToLAN(false);
      }
    };

    checkLAN(); // initial check
    intervalId = window.setInterval(checkLAN, intervalMs);

    return () => clearInterval(intervalId);
  }, [intervalMs]);

  return { isConnectedToLAN };
}
