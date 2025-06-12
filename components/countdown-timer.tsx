import React, { useEffect, useState } from "react";

const CountdownTimer = ({ targetDate }: { targetDate: Date }) => {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);

    return () => clearInterval(timer); // cleanup on unmount
  }, [targetDate]);

  return (
    <div>
      {formatTime(timeLeft)}
    </div>
  );
};

// Utility: get time difference in hours, minutes, seconds
function getTimeLeft(targetDate: Date) {
  const now = new Date();
  const diff = Math.max(targetDate.getTime() - now.getTime(), 0);


  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60))%24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { days, hours, minutes, seconds };
}

// Utility: format time as HH:MM:SS
function formatTime({ days, hours, minutes, seconds }: { days: number; hours: number; minutes: number; seconds: number }) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export default CountdownTimer;
