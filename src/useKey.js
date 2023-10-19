import { useEffect } from "react";

export function useKey(key, action) {
  useEffect(() => {
    const callback = (evt) => {
      if (evt.code.toLowerCase() === key.toLowerCase()) {
        action();
      }
    };
    document.addEventListener("keydown", callback);
    return function () {
      document.removeEventListener("keydown", callback);
    };
  }, [action, key]);
}
