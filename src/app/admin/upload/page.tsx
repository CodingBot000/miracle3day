"use client";

import PageHeader from "@/components/molecules/header/page-header";
import InputField from "@/components/molecules/form/input-field";

import styles from "./upload.module.scss";
import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Button from "@/components/atoms/button";
import { useFormState } from "react-dom";
import { uploadActions } from "./actions";
import { SurgeriesModal } from "./modal";
import { createClient } from "@/utils/supabase/client";
import { useQuery } from "@tanstack/react-query";
import LoadingSpinner from "@/components/atoms/loading/spinner";
import { SubmitButton } from "./button";
import useModal from "@/hooks/useModal";
import { AlertModal } from "@/components/template/modal/alert";
import { useRouter } from "next/navigation";

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
  const router = useRouter();

  const ref = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const { data: surgeryList = [], isPending } = useQuery<Surgery[]>({
    queryKey: ["surgery_info"],
    queryFn: async () => {
      const { data, error } = await supabase.from("surgery_info").select("*");

      if (error) {
        throw Error("surgery_info error");
      }

      return data;
    },
  });

  const [state, actions] = useFormState(uploadActions, null);

  const { handleOpenModal, open } = useModal();

  useEffect(() => {
    if (state?.message) {
      handleOpenModal();
    }
  }, [state]);

  const handleModal = () => {
    if (state?.status === "success") {
      router.refresh();
    }

    handleOpenModal();
  };

  const [preview, setPreview] = useState<Array<string | undefined>>([]);
  const [file, setFile] = useState<Array<File>>([]);

  const handleUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;

    if (!files) return;

    const fileList = Array.from(files).slice(0, 6 - preview.length);

    setFile(fileList);

    fileList.forEach((file) => {
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const result = fileReader.result as string;
        setPreview((prev) => {
          return prev.concat(result);
        });
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

      <form className={styles.form} action={actions}>
        <div className={styles.input_form}>
          <InputField label={"name"} name={"name"} required />
          <InputField label={"searchkey"} name={"searchkey"} required />
          <InputField label={"latitude"} name={"latitude"} required />
          <InputField label={"longitude"} name={"longitude"} required />
          <InputField label={"location"} name={"location"} required />

          <SurgeriesModal itemList={surgeryList} />
        </div>

        <div className={styles.title}>
          <h2>image 등록</h2>
          <p>
            등록 {preview.length}/{imageUploadLength}
          </p>
        </div>

        <div className={styles.img_wrapper}>
          {Array.from({ length: imageUploadLength }, (v, i) => {
            return (
              <div className={styles.img_box} key={i}>
                {preview[i] ? (
                  <div
                    id={file[i]?.lastModified.toString()}
                    className={styles.delete_btn}
                    onClick={(e) => {
                      handleDeletePreview(e, i);
                    }}
                  >
                    삭제
                  </div>
                ) : (
                  <label className={styles.img_label} htmlFor={`imageurls`}>
                    이미지 업로드
                  </label>
                )}

                {preview[i] && (
                  <Image
                    src={preview[i]}
                    alt={`preview-${i}`}
                    fill
                    className={styles.img_preview}
                  />
                )}
              </div>
            );
          })}
          <input
            ref={ref}
            id={"imageurls"}
            multiple
            name="imageurls"
            accept="image/*"
            type="file"
            className={styles.img}
            onChange={handleUpload}
          />
        </div>
        <div className={styles.btn_group}>
          <Button type="reset" color="red">
            cancel
          </Button>
          <SubmitButton />
        </div>
      </form>

      <AlertModal onCancel={handleModal} open={open}>
        {Array.isArray(state?.message) ? state?.message[0] : state?.message}
      </AlertModal>
    </main>
  );
};

export default UploadTestPage;
