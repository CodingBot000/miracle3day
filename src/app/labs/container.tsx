'use client';

import dynamic from "next/dynamic";
import { useState } from "react";


const TreatmentInfoSection = dynamic(() => import("@/app/labs/treatment-info-section"), {
  ssr: false,
});


const PartnerClinicsSection = dynamic(() => import("@/app/labs/partner-clinics-section"), {
    ssr: false,
  });

  const ConcernBaedGuide = dynamic(() => import("@/app/labs/concern-based-guide"), {
    ssr: false,
  });

  const TrustSection = dynamic(() => import("@/app/labs/trust-section"), {
    ssr: false,
  })
  const tabs = ["TreatmentInfo", "PartenrClinic", "ConcernBaedGuide", "TrustSection"];
  
export default function ContainerPage() {
    const [curTab, setCurTab] = useState<number>(0);
    return (
      <div>
        <header>
        <div className="flex-cols justify-center">
          {tabs.map((tab, index) => (
            <button
              key={index}
              className={`px-4 py-2 ${
                curTab === index ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
              onClick={() => setCurTab(index)}
            >
              {tab}
            </button>
          ))}
          </div>
          </header>
        <div>
          {curTab == 0 && (
            <div>
              <h1>Treatement-infoSection</h1>
              <TreatmentInfoSection />
            </div>
          ) || curTab == 1 && (
            <div>
              <h1>Partner Clinics Section</h1>
              <PartnerClinicsSection  />
            </div>
          ) || curTab == 2 && (
            <div>
              <h1>Concern Baed Guide</h1>
              <ConcernBaedGuide />
            </div>
          ) || curTab == 3 && (
            <div>
              <h1>Trust Section</h1>
              <TrustSection />
            </div>
          )}
            
        </div>
        </div>
    )

}