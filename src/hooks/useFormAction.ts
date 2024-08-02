import { useSearchParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";

interface FormActionProps {
  action: (state: State, formData: FormData) => Promise<State>;
  initialState?: State;
}

type State = {
  error: { [key: string]: string[] };
};

export const useFormAction = ({
  action,
  initialState = { error: {} },
}: FormActionProps) => {
  const status = useSearchParams().get("status");
  const errorMessage = useSearchParams().get("msg");

  const [state, formAction] = useFormState<State, FormData>(
    action,
    initialState
  );

  const formStatus = useFormStatus();

  return {
    status,
    state: state || initialState,
    errorMessage,
    formAction,
    formStatus,
    isError: status ? status === "error" : undefined,
    isSuccess: status ? status !== "error" : undefined,
    isFetching: !!status,
  };
};
