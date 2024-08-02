import { ChangeEvent, useState } from "react";

interface useInputProps {
  key: string[];
}

export const useInput = ({ key }: useInputProps) => {
  const initState = key.reduce<Record<(typeof key)[number], string>>(
    (acc, cur) => {
      acc[cur] = "";

      return acc;
    },
    {}
  );

  const [value, setValue] = useState(initState);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setValue((prev) => ({ ...prev, [name]: value }));
  };

  const handleInputReset = () => {
    setValue(initState);
  };

  return {
    value,
    setValue,
    handleInputChange,
    handleInputReset,
  };
};
