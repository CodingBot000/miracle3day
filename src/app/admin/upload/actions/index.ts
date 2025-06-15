"use server";

import { STORAGE_IMAGES, TABLE_HOSPITAL, TABLE_HOSPITAL_DETAIL } from "@/constants/tables";
import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export const uploadActions = async (prevState: any, formData: FormData) => {
  const supabase = createClient();

  const name = formData.get("name") as string;
  const surgeries = formData.get("surgeries") as string;
  const searchkey = formData.get("searchkey") as string;
  const search_key = formData.get("search_key") as string;
  const latitude = formData.get("latitude") as string;
  const longitude = formData.get("longitude") as string;
  const location = formData.get("location") as string;
  const imageurls = formData.getAll("imageurls");
console.log("uploadActions") 
  const filenames = await Promise.all(
    imageurls
      .filter((entry) => entry instanceof File)
      .map(async (e) => {
        const upload = await supabase.storage
          .from(STORAGE_IMAGES)
          .upload(`hospitalimg/${e.name}`, e);

        if (upload.error) {
          console.log("uploadActions filenames upload.error: ", upload.error) ;
          return {
            ...prevState,
            message: upload.error.message,
            status: "error",
          };
        }
        console.log("uploadActions filenames return") ;
        return `${process.env.NEXT_PUBLIC_IMG_URL}${upload.data?.path}`;
      })
  );

  if (filenames.find((e) => e.message)) {
    console.log("uploadActions -a filenames.find error: ", filenames[0].message) ;
    return {
      ...prevState,
      message: filenames[0].message,
      status: "error",
    };
  }

  const lastUnique = await supabase
    .from(TABLE_HOSPITAL)
    .select("id_unique")
    .order("id_unique", { ascending: false })
    .limit(1);

  if (!lastUnique.data || lastUnique.error) {
    console.log("uploadActions -b") ;
    return {
      ...prevState,
      message: lastUnique.error.code || lastUnique.error.message,
      status: "error",
    };
  }

  const form = {
    id_unique: lastUnique.data[0].id_unique + 1,
    name,
    id_surgeries: surgeries.split(","),
    searchkey,
    search_key,
    latitude,
    longitude,
    location,
    imageurls: filenames,
  };

  const insertHospital = await supabase
    .from(TABLE_HOSPITAL)
    .insert(form)
    .select("*");

  const removeStorageImg = async () => {
    console.log("uploadActions removeStorageImg");
    const filenames = imageurls.filter((entry) => entry instanceof File);

    const remove = await supabase.storage
      .from(STORAGE_IMAGES)
      .remove(filenames.map((e) => `hospitalimg/${e.name}`));

    const error = remove.error || insertHospital.error;

    if (error) {
      console.log("uploadActions removeStorageImg error : ", error);
      return {
        ...prevState,
        message: error.message,
        status: "error",
      };
    }
  } 

  console.log("uploadActions insertHospital error 1 : ", insertHospital.error);
  if (insertHospital.error) {
    // error 발생 시 업로드 했더 이미지 삭제
    removeStorageImg();
    console.log("uploadActions insertHospital error 2 : ", insertHospital.error);
    return {
      ...prevState,
      message: insertHospital.error.message,
      status: "error",
    };
  }

  const hospitalDetailDefaultValue = (id_uuid_hospital: string, id_hospital: string) => ({
    id_uuid_hospital,
    id_hospital,
    tel: "0507-1433-0210",
    // kakaotalk: "",
    // homepage: "http://www.reoneskin.com",
    // instagram: "https://www.instagram.com/reone__clinic/",
    // facebook: "",
    // blog: "https://blog.naver.com/reone21",
    // youtube: "https://www.youtube.com/watch?v=Yaa1HZJXIJY",
    // ticktok:
    //   "https://www.tiktok.com/@vslineclinicglobal/video/7255963489192168711?is_from_webapp=1&sender_device=pc&web_id=7373256937738012176",
    // snapchat: "",
    map: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3164.348038374547!2d127.02511807637043!3d37.52329227204984!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x357ca39ea4618cdb%3A0xd0ad0677746be4c7!2z7Jyg7KeE7Iqk7J2Y7JuQ!5e0!3m2!1sko!2skr!4v1716566609639!5m2!1sko!2skr",
    // desc_address: "327, Dosan-daero, Gangnam-gu, Seoul, Republic of Korea",
    // desc_openninghour: `
    //   MON
    //   10:00 - 19:00
    //   13:00 - 14:00 BreakTime
    //   TUE
    //   10:00 - 19:00
    //   13:00 - 14:00 BreakTime
    //   WED
    //   10:00 - 19:00
    //   13:00 - 14:00 BreakTime
    //   THU
    //   10:00 - 19:00
    //   13:00 - 14:00 BreakTime
    //   FRI
    //   10:00 - 19:00
    //   13:00 - 14:00 BreakTime
    //   SAT
    //   10:00 - 16:00
    //   SUN
    //   Regular holiday (Event Week SunDay)
    // `,
    // desc_facilities:
    //   "Separate Male/Female Restrooms, Wireless Internet, Parking, Valet Parking",
    // desc_doctors_imgurls: [
    //   "https://tqyarvckzieoraneohvv.supabase.co/storage/v1/object/public/images/doctors/doctor_reone1.png",
    //   "https://tqyarvckzieoraneohvv.supabase.co/storage/v1/object/public/images/doctors/doctor_reone2.png",
    //   "https://tqyarvckzieoraneohvv.supabase.co/storage/v1/object/public/images/doctors/doctor_reone3.png",
    // ],
    etc: "",
  });

  const { error } = await supabase
    .from(TABLE_HOSPITAL_DETAIL)
    .insert([hospitalDetailDefaultValue(insertHospital.data[0].id_uuid, insertHospital.data[0].id_unique)]);
  
  if (error) {
    console.log("uploadActions error 3 : ", error);
    removeStorageImg();

    return {
      ...prevState,
      message: error.message,
      status: "error",
    };
  }

  revalidatePath("/", "layout");
  console.log("uploadActions No error uploadActions ");
  return {
    ...prevState,
    message: "success upload!",
    status: "success",
  };
};
