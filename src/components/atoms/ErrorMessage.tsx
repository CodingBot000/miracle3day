interface ErrorMessageProps {
  message: string | string[];
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (Array.isArray(message)) {
    return (
      <>
        {message.map((msg, i) => (
          <p className="my-2 text-red-500" key={i}>
            {msg}
          </p>
        ))}
      </>
    );
  }

  return <p className="my-2 text-red-500">{message}</p>;
};
