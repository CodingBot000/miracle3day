"use client";

import { useEffect, useRef, useState } from "react";
import { ROUTE } from "@/router";
import { useFormState } from "react-dom";
import InputField from "@/components/molecules/form/input-field";
import { useRouter, useSearchParams } from "next/navigation";
import { useTimer } from "@/hooks/useTimer";
import VerifyButton from "./verifyButton";
import verifyActions from "./actions/email-verification.actions";
import useModal from "@/hooks/useModal";
import { ModalOverlay } from "@/components/organism/layout/ModalOverlay";
import Button from "@/components/atoms/button/Button";

const EmailVerificationClient = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const ref = useRef<HTMLInputElement>(null);

  const paramsObject = Object.fromEntries(searchParams.entries());
  const emptyParamsCheck = Object.entries(paramsObject).every(
    ([, value]) => value
  );

  if (searchParams.size !== 5 || !emptyParamsCheck) {
    router.replace(ROUTE.SIGN_UP);
  }

  const initNoticeModal = useModal();
  const timeoutModal = useModal();

  const [timeOver, setTimeOver] = useState<boolean>(false);

  const [state, verifyCode] = useFormState<
    { message: string | null },
    FormData
  >(verifyActions, { message: null });

  const [message, setMessage] = useState<string | null>(null);

  const { minute, second, setStartTimer, startTimer, handleStopTimer } =
    useTimer({
      time: 180,
      timeOver,
      setTimeOver,
    });

  const handleStartTimer = () => {
    setStartTimer(true);
    initNoticeModal.setOpen(false);
  };

  const handleTimeoutModal = () => {
    timeoutModal.setOpen(false);
    router.replace(ROUTE.SIGN_UP);
  };

  const handleErrorClear = () => {
    setMessage(null);
    setStartTimer(true);
  };

  useEffect(() => {
    if (!startTimer && !initNoticeModal.open && !message) {
      initNoticeModal.setOpen(true);
    }
  }, []);

  useEffect(() => {
    if (timeOver) {
      timeoutModal.setOpen(true);
    }

    if (state?.message) {
      setMessage(state.message);
    }
  }, [state, timeOver]);

  return (
    <main className="flex flex-col items-center w-full max-w-[80%] sm:w-1/2 mx-auto">
      <h1 className="my-12 text-xl font-bold">Sign Up</h1>

      <form
        className="w-full"
        action={(form) => {
          verifyCode(form);
          handleStopTimer();
        }}
      >
        <div className="relative my-4">
          <InputField
            ref={ref}
            label="Code"
            name="code"
            minLength={6}
            maxLength={6}
          />
          <p className="absolute bottom-[35%] right-[5%] text-red-500 text-sm font-light">
            {`${minute}분 ${second}초`}
          </p>
        </div>

        <VerifyButton disabled={timeOver} />
      </form>

      {/* notice modal */}
      <ModalOverlay open={initNoticeModal.open} handleClick={() => {}}>
        <p className="m-4">
          Check your email! We have sent you a 6-digit code. Enter it below to
          verify your email address.
        </p>
        <Button color="blue" onClick={handleStartTimer}>
          Confirm
        </Button>
      </ModalOverlay>

      {/* timeout modal */}
      <ModalOverlay open={timeoutModal.open} handleClick={() => {}}>
        <p className="m-4">
          The verification code has expired. Please request a new code to
          proceed.
        </p>
        <Button color="blue" onClick={handleTimeoutModal}>
          Confirm
        </Button>
      </ModalOverlay>

      {/* form submit error modal */}
      <ModalOverlay open={!!message} handleClick={handleErrorClear}>
        <p className="m-4">{message}</p>
        <Button color="blue" onClick={handleErrorClear}>
          Confirm
        </Button>
      </ModalOverlay>
    </main>
  );
};

export default EmailVerificationClient;
