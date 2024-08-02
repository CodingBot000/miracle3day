import styles from "./error-message.module.scss";

interface ErrorMessageProps {
  message: string | string[];
}

export const ErrorMessage = ({ message }: ErrorMessageProps) => {
  if (message instanceof Array) {
    return (
      <>
        {message.map((msg, i) => (
          <p className={styles.errMessage} key={i}>
            {msg}
          </p>
        ))}
      </>
    );
  }

  return <p className={styles.errMessage}>{message}</p>;
};
