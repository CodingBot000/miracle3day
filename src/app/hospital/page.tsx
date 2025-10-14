import { getHospitalLocationAPI } from "../api/home/hospital/location";
import { LocationEnum } from "@/constants";
import { Metadata } from "next";
import HospitalListNewDesign from "./components/HospitalListNewDesign";
import { getHospitalListAPI } from "../api/hospital/list";

type Props = {
  searchParams: { locationNum?: string };
};

export const metadata: Metadata = {
  title: "Clinic List | Beauty Well",
  description: "Find the best beauty and medical hospitals in Korea",
};

const HospitalListPage = async ({ searchParams }: Props) => {
  // const locationNum = (searchParams.locationNum as LocationEnum) || LocationEnum.Apgujung;
  
  // Fetch initial hospital data
  const data = await getHospitalListAPI();
  
  // No additional processing needed - data already has correct show field

  return (
    <main className="min-h-screen bg-white">
      <HospitalListNewDesign initialData={data.data} />
    </main>
  );
};

export default HospitalListPage;
