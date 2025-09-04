import { getHospitalLocationAPI } from "../api/home/hospital/location";
import { LocationEnum } from "@/constants";
import { Metadata } from "next";
import HospitalListNewDesign from "./components/HospitalListNewDesign";

type Props = {
  searchParams: { locationNum?: string };
};

export const metadata: Metadata = {
  title: "Hospital List | Beauty Well",
  description: "Find the best beauty and medical hospitals in Korea",
};

const HospitalListPage = async ({ searchParams }: Props) => {
  const locationNum = (searchParams.locationNum as LocationEnum) || LocationEnum.Apgujung;
  
  // Fetch initial hospital data
  const data = await getHospitalLocationAPI({ locationNum });
  
  return (
    <main className="min-h-screen bg-white">
      <HospitalListNewDesign initialData={data.data} initialLocation={locationNum} />
    </main>
  );
};

export default HospitalListPage;
