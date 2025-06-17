"use client";

import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";
import Button from "@/components/atoms/button/Button";
import { ConfirmModal } from "@/components/template/modal";
import useModal from "@/hooks/useModal";
import React from "react";
import { policy } from "./policy";
import TermsPage from "@/app/auth/terms/page";

const SignUpButton = () => {
  console.log('SignUpButton rendered');
  const router = useRouter();
  const { handleOpenModal, open } = useModal();

  const handleConfirm = () => {
    console.log('SignUpButton handleConfirm');
    router.push(ROUTE.SIGN_UP);
  };

  const parsedData = policy.replace(/\\"/g, '"');
  const policyArray = parsedData.split("\n");

  return (
    <>
      <Button
        variant="outline"
        color="blue"
        onClick={(e) => {
          e.preventDefault();
          // handleOpenModal();
          router.push('/auth/terms');    
        }}
      >
        SIGN UP
      </Button>

{/*       
      <ConfirmModal
        open={open}
        title="Policy and Terms"
        onCancel={handleOpenModal}
        onConfirm={handleConfirm}
      >
        <div className="text-left text-[20px] mx-[10px]">
          {policyArray.map((line) => (
            <p key={line}>
              {line}
              <br />
            </p>
          ))}
        </div>
      </ConfirmModal> */}
    </>
  );
};

export default SignUpButton;
