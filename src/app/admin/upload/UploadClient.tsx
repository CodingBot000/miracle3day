"use client";

import PageHeader from "@/components/molecules/PageHeader";
import InputField from "@/components/molecules/form/input-field";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/atoms/button/Button";
import { uploadActions } from "./actions";
import { SurgeriesModal } from "./modal";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atoms/loading/LoadingSpinner";
import { SubmitButton } from "./button";
import useModal from "@/hooks/useModal";
import { AlertModal } from "@/components/template/modal/Modal";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

interface Surgery {
  created_at: string;
  description: string;
  id: number;
  id_unique: number;
  imageurls: string[];
  name: string;
  type: string;
}

const imageUploadLength = 6;

const UploadTestPage = () => {
  const state = useFormStatus();
  const router = useRouter();
  const ref = useRef<HTMLInputElement>(null);
  const supabase = createClient();
  const [formState, setFormState] = useState<{ message?: string; status?: string } | null>(null);

  const { data: surgeryList = [], isPending } = useQuery<Surgery[]>({
    queryKey: ["surgery_info"],
    queryFn: async () => {
      const { data, error } = await supabase.from("surgery_info").select("*");
      if (error) throw Error("surgery_info error");
      return data;
    },
  });

  const { handleOpenModal, open } = useModal();

  useEffect(() => {
    if (formState?.message) {
      handleOpenModal();
    }
  }, [formState]);

  const handleModal = () => {
    if (formState?.status === "success") {
      router.refresh();
    }
    handleOpenModal();
  };

  const [preview, setPreview] = useState<Array<string | undefined>>([]);
  const [file, setFile] = useState<Array<File>>([]);

  // const handleSubmit = async (formData: FormData) => {
  //   try {
  //     const result = await uploadActions(null, formData);
  //     setFormState(result);
  //   } catch (error) {
  //     setFormState({ message: "업로드 중 오류가 발생했습니다.", status: "error" });
  //   }
  // };
  const handleSubmit = async (formData: FormData) => {
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
  
      const result = await res.json();
      setFormState(result);
    } catch (error) {
      console.log("upload error", error);
      setFormState({ message: "업로드 중 오류가 발생했습니다.", status: "error" });
    }
  };

  
  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (!files) return;

    const fileList = Array.from(files).slice(0, 6 - preview.length);
    setFile(fileList);

    fileList.forEach((file) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const result = fileReader.result as string;
        setPreview((prev) => prev.concat(result));
      };
      fileReader.readAsDataURL(file);
    });
  };

  const handleDeletePreview = (e: MouseEvent<HTMLDivElement>, i: number) => {
    e.preventDefault();
    if (ref.current && ref.current.files) {
      const dataTransfer = new DataTransfer();
      const file = ref.current.files;
      const fileId = (e.target as HTMLDivElement).id;
      Array.from(file)
        .filter((file) => file.lastModified !== +fileId)
        .forEach((file) => {
          dataTransfer.items.add(file);
        });
      ref.current.files = dataTransfer.files;
    }
    setPreview((prev) => prev.filter((e, idx) => i !== idx));
  };

  if (isPending) return <LoadingSpinner backdrop />;

  return (
    <main>
      <PageHeader name="Upload Test" />
      {/* <form 
        className={styles.form} 
        action={handleSubmit}
      > */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          handleSubmit(formData);
        }}
        className="max-w-[746px] my-8 mx-auto w-[calc(100%-24px)]"
      >
      <div className="space-y-4">
        <InputField label="name" name="name" required />
        <InputField label="searchkey" name="searchkey" required />
        <InputField label="search_key" name="search_key" required />
        <InputField label="latitude" name="latitude" required />
        <InputField label="longitude" name="longitude" required />
        <InputField label="location" name="location" required />
        <SurgeriesModal itemList={surgeryList} />
      </div>
       {/* tune face
        liposuction  */}
      <div className="flex justify-between my-4">
        <h2>image 등록</h2>
        <p>등록 {preview.length}/{imageUploadLength}</p>
      </div>


      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-2 w-full aspect-[1/1]">
        {Array.from({ length: imageUploadLength }, (_, i) => (
          <div className="relative mx-auto w-full" key={i}>
            {preview[i] ? (
              <div
                id={file[i]?.lastModified.toString()}
                className="absolute top-4 right-4 z-20 px-2 py-1 bg-black text-white cursor-pointer"
                onClick={(e) => handleDeletePreview(e, i)}
              >
                삭제
              </div>
            ) : (
              <label
                htmlFor="imageurls"
                className="flex items-center justify-center w-full h-full border border-black"
              >
                이미지 업로드
              </label>
            )}
            {preview[i] && (
              <Image
                src={preview[i]}
                alt={`preview-${i}`}
                fill
                className=""
              />
            )}
          </div>
        ))}
        <input
          ref={ref}
          id="imageurls"
          multiple
          name="imageurls"
          accept="image/*"
          type="file"
          className="hidden"
          onChange={handleUpload}
        />
      </div>

      <div className="flex justify-center mt-8 gap-8">
        <Button type="reset" color="red">cancel</Button>
        <Button color="blue" disabled={state.pending}>
          {state.pending ? "...submit" : "preview"}
        </Button>
      </div>

      </form>

      <AlertModal onCancel={handleModal} open={open}>
        Upload Client Test error: {Array.isArray(formState?.message) ? formState?.message[0] : formState?.message}
      </AlertModal>
    </main>
  );
};

export default UploadTestPage;
