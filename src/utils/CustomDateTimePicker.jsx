import React, { useState, useEffect } from "react";
import { Calendar, Clock, ChevronLeft, ChevronRight } from "lucide-react";

const CustomDateTimePicker = ({
  value,
  onChange,
  isDarkMode = false,
  placeholder = "Select date and time",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState({
    hour: 12,
    minute: 0,
    period: "AM",
  });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);

      let hours = date.getHours();
      const minutes = date.getMinutes();
      const period = hours >= 12 ? "PM" : "AM";

      if (hours === 0) hours = 12;
      else if (hours > 12) hours -= 12;

      setSelectedTime({ hour: hours, minute: minutes, period });
      setCurrentMonth(date);
    }
  }, [value]);

  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const handleDateClick = (day) => {
    const newDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    );
    setSelectedDate(newDate);

    // Combine date with selected time
    let finalHour = selectedTime.hour;
    if (selectedTime.period === "AM" && finalHour === 12) finalHour = 0;
    else if (selectedTime.period === "PM" && finalHour !== 12) finalHour += 12;

    const finalDate = new Date(
      newDate.getFullYear(),
      newDate.getMonth(),
      newDate.getDate(),
      finalHour,
      selectedTime.minute
    );

    onChange(finalDate.toISOString());
  };

  const handleTimeChange = (type, value) => {
    const newTime = { ...selectedTime, [type]: value };
    setSelectedTime(newTime);

    if (selectedDate) {
      let finalHour = newTime.hour;
      if (newTime.period === "AM" && finalHour === 12) finalHour = 0;
      else if (newTime.period === "PM" && finalHour !== 12) finalHour += 12;

      const finalDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        finalHour,
        newTime.minute
      );

      onChange(finalDate.toISOString());
    }
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const formatDisplayValue = () => {
    if (!selectedDate) return "";

    const date = selectedDate.toLocaleDateString();
    const timeStr = `${selectedTime.hour
      .toString()
      .padStart(2, "0")}:${selectedTime.minute.toString().padStart(2, "0")} ${
      selectedTime.period
    }`;
    return `${date} ${timeStr}`;
  };

  const renderCalendar = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth.getMonth() &&
        selectedDate.getFullYear() === currentMonth.getFullYear();

      const isToday =
        new Date().toDateString() ===
        new Date(
          currentMonth.getFullYear(),
          currentMonth.getMonth(),
          day
        ).toDateString();

      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          className={`p-2 text-sm rounded-lg hover:bg-blue-100 transition-colors ${
            isSelected
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : isToday
              ? isDarkMode
                ? "bg-gray-600 text-white"
                : "bg-gray-200 text-gray-900"
              : isDarkMode
              ? "text-gray-300 hover:bg-gray-600"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="relative ">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border rounded-lg cursor-pointer flex items-center justify-between ${
          isDarkMode
            ? "bg-gray-700 border-gray-600 text-white"
            : "bg-white border-gray-300 text-gray-900"
        }`}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className={selectedDate ? "" : "text-gray-500"}>
            {formatDisplayValue() || placeholder}
          </span>
        </div>
      </div>

      {isOpen && (
        <>
          <div
            className=" sticky inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div
            className={`absolute -top-100 left-0 mt-1 z-20 p-4 rounded-lg shadow-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-600"
                : "bg-white border-gray-200"
            }`}
            style={{ minWidth: "300px" }}
          >
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth(-1)}
                className={`p-1 rounded hover:bg-gray-100 ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "text-gray-600"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <h3
                className={`font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {monthNames[currentMonth.getMonth()]}{" "}
                {currentMonth.getFullYear()}
              </h3>

              <button
                onClick={() => navigateMonth(1)}
                className={`p-1 rounded hover:bg-gray-100 ${
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-300"
                    : "text-gray-600"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days of week header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  className={`p-2 text-xs font-medium text-center ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1 mb-4">
              {renderCalendar()}
            </div>

            {/* Time Picker */}
            <div
              className={`border-t pt-4 ${
                isDarkMode ? "border-gray-600" : "border-gray-200"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span
                  className={`text-sm font-medium ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Time
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Hour */}
                <select
                  value={selectedTime.hour}
                  onChange={(e) =>
                    handleTimeChange("hour", parseInt(e.target.value))
                  }
                  className={`px-2 py-1 border rounded text-sm ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {[...Array(12)].map((_, i) => (
                    <option key={i} value={i + 1}>
                      {i + 1}
                    </option>
                  ))}
                </select>

                <span
                  className={isDarkMode ? "text-gray-300" : "text-gray-700"}
                >
                  :
                </span>

                {/* Minute */}
                <select
                  value={selectedTime.minute}
                  onChange={(e) =>
                    handleTimeChange("minute", parseInt(e.target.value))
                  }
                  className={`px-2 py-1 border  rounded text-sm ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  {[...Array(60)].map((_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>

                {/* AM/PM */}
                <select
                  value={selectedTime.period}
                  onChange={(e) => handleTimeChange("period", e.target.value)}
                  className={`px-2 py-1 border rounded text-sm ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                >
                  <option value="AM">AM</option>
                  <option value="PM">PM</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  onChange(null);
                  setSelectedDate(null);
                  setIsOpen(false);
                }}
                className={`px-3 py-1 text-sm rounded border ${
                  isDarkMode
                    ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                Clear
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CustomDateTimePicker;
