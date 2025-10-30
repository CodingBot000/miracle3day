// import TreatmentInfoSection from "./treatment-info-section";
import dynamic from "next/dynamic";


// const TreatmentInfoSection = dynamic(() => import("@/app/labs/treatment-info-section"), {
//   ssr: false,
// });


// const PartnerClinicsSection = dynamic(() => import("@/app/labs/partner-clinics-section"), {
//     ssr: false,
//   });

  const ContainerPage = dynamic(() => import("@/app/labs/container"), {
    ssr: false,
  })
  
export default function LabsPage() {

    return (
        <div>
            {/* <h1>Treatement-infoSection</h1>
            <TreatmentInfoSection />

            <h1>Partner Clinics Section</h1>
            <PartnerClinicsSection  /> */}
            <ContainerPage />
        </div>
    )

}