import { useState, useEffect, useCallback } from "react";

export function useLocalStorage(key, initialValue) {
  // Get initial value from localStorage
  const [stored, setStored] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(stored) : value;
        // Update state
        setStored(valueToStore);
        // Update localStorage
        if (valueToStore === null || valueToStore === undefined) {
          window.localStorage.removeItem(key);
        } else {
          const stringValue = JSON.stringify(valueToStore);
          window.localStorage.setItem(key, stringValue);
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  ); // Removed 'stored' from dependencies

  // Listen for storage changes from other tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          const newValue = e.newValue ? JSON.parse(e.newValue) : initialValue;
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
