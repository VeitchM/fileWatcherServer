import { useState, useEffect } from "react";
import {SERVER_URL} from "../../serverConfig"

export async function appFetchLog() {
  return fetch(SERVER_URL + "/log", { method: "GET" }).then((JSON) => {
    return JSON.json();
  });
}

export function appSubscribeChanges(callbackOnChange: (data: any) => void) {
  const eventSource = new EventSource(SERVER_URL + "/events");

  const onClose = () => {
    eventSource.removeEventListener("message", onMessage);
    eventSource.removeEventListener("error", onError);
    eventSource.close();
  };

  const onMessage = (event: MessageEvent) => {
    console.log("Server message:", event.data);
    
    callbackOnChange(JSON.parse(event.data));
  };

  const onError = (event: Event) => {
    console.error("EventSource failed:", event);
    onClose();
  };

  // Handle connection errors
  eventSource.addEventListener("error", onError);
  eventSource.addEventListener("message", onMessage);

  return onClose;
}

export function useLog() {
  const [log, setLog] = useState("");

  useEffect(() => {
    appFetchLog().then((data) => {
      console.log("Data on fetch", data);
      setLog(data.data);
    });

    const unsubscribe = appSubscribeChanges(setLog);
    return unsubscribe;
  }, []);

  return log;
}
