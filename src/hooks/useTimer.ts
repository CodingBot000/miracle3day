import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

interface useTimerProps {
  time: number;

  setTimeOver: Dispatch<SetStateAction<boolean>>;
  timeOver: boolean;
}

export const useTimer = ({ setTimeOver, timeOver, time }: useTimerProps) => {
  const timeRef = useRef<number>(time);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [startTimer, setStartTimer] = useState<boolean>(false);
  const [stopTimer, setStopTimer] = useState<boolean>(false);

  const [state, setState] = useState({
    minute: Math.floor(time / 60),
    second: time % 60,
  });

  const handleClearTime = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const handleStopTimer = () => {
    setStartTimer(false);
    handleClearTime();
  };

  useEffect(() => {
    if (timeOver) return;

    if (startTimer) {
      timerRef.current = setInterval(() => {
        const time = timeRef.current;
        const minute = Math.floor(time / 60);
        const second = time % 60;

        timeRef.current--;

        setState({ minute, second });

        if (timerRef.current && timeRef.current < 0) {
          clearInterval(timerRef.current);
          setTimeOver(true);
        }
      }, 1000);
    } else if (stopTimer) {
      handleStopTimer();
    }

    return () => {
      handleClearTime();
    };
  }, [startTimer, setTimeOver, setStopTimer, timeOver, stopTimer]);

  return {
    ...state,
    setStartTimer,
    setStopTimer,
    handleStopTimer,
    startTimer,
  };
};
