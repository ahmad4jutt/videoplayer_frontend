import { useState, useEffect } from "react";

export default function UseLocalStorage(key, initialValue) {
  // Get initial value from localStorage
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      console.log(`UseLocalStorage init - key: ${key}, item: ${item}`);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      console.log(`UseLocalStorage setValue - key: ${key}, value:`, value);

      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(stored) : value;

      // Update state
      setStored(valueToStore);

      // Update localStorage
      if (valueToStore === null || valueToStore === undefined) {
        console.log(`Removing localStorage key: ${key}`);
        window.localStorage.removeItem(key);
      } else {
        const stringValue = JSON.stringify(valueToStore);
        console.log(`Setting localStorage key: ${key} = ${stringValue}`);
        window.localStorage.setItem(key, stringValue);
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
          console.log(`Storage changed for key ${key}:`, newValue);
          setStored(newValue);
        } catch (error) {
          console.error(
            `Error parsing storage change for key "${key}":`,
            error
          );
          setStored(initialValue);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue]);

  return [stored, setValue];
}
