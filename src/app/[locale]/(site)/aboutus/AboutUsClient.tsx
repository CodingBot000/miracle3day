import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LucideSparkles } from "lucide-react";

import { aboutUsContent } from "@/app/[locale]/(site)/contents/aboutUsContent";
import Image from "next/image";

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-[#fdfdfd] text-gray-800 px-6 py-12 md:px-24 lg:px-40">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 tracking-tight text-[#1f1f1f]">
            {aboutUsContent.slogan.description}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            {aboutUsContent.info1.description}
          </p>
          <div className="relative w-full aspect-[16/9] mt-8 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/default/aboutus_hero.jpg"
              alt="Korean beauty clinic"
              fill
              className="object-cover"
            />
          </div>

        </section>

        <Separator className="my-12" />

        <section className="space-y-10 text-base leading-relaxed text-gray-700">
          <Card className="shadow-md">
            <CardContent className="p-6 md:p-10 space-y-6">
              <div className="flex items-center gap-3">
                <LucideSparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-semibold">{aboutUsContent.info2.title}</h2>
              </div>
              <p>
                {aboutUsContent.info2.description}
                {aboutUsContent.info3.description}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6 md:p-10 space-y-6">
              <h2 className="text-2xl font-semibold">{aboutUsContent.info4.title}</h2>
              <p>
              {aboutUsContent.info4.description}
                
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>{aboutUsContent.info5.description}</li>
                <li>{aboutUsContent.info6.description}</li>
                <li>{aboutUsContent.info7.description}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6 md:p-10 space-y-6">
              <h2 className="text-2xl font-semibold">
                {aboutUsContent.info8.description}
              </h2>
              <p>
              {aboutUsContent.info9.description}
              </p>
              {/* 이미지 위치: 의료진 상담 모습 또는 고객과의 신뢰 있는 장면 */}
              <Image
                src="/default/aboutus_consultation.jpg"
                alt="Doctor consultation"
                width={800}
                height={600}
                className="mt-4 rounded-lg shadow-sm w-full h-auto"
              />

            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardContent className="p-6 md:p-10 space-y-6">
              <h2 className="text-2xl font-semibold">{aboutUsContent.info10.description}</h2>
              <p>
              {aboutUsContent.info11.description}
              </p>
              <ul className="list-disc list-inside space-y-2">
                <li>{aboutUsContent.info12.description}</li>
                <li>{aboutUsContent.info13.description}</li>
                <li>{aboutUsContent.info14.description}</li>
              </ul>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-16" />

        {/* Closing Statement */}
        <section className="text-center max-w-3xl mx-auto">
          <h3 className="text-xl md:text-2xl font-semibold mb-4">
            {aboutUsContent.info15.description}
          </h3>
          <p className="text-base text-muted-foreground">
            {aboutUsContent.info16.description}
          </p>
        </section>
      </div>
    </div>
  );
}


// "use client";

// import PageHeader from "@/components/molecules/PageHeader";
// import { aboutUsContent } from "./aboutUsContent";

// const AboutUsClient = () => {
//   return (
//     <>
//       <PageHeader name="About Us" />
//       <div className="mx-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
//         <p className="mb-4">
//           The purpose of BeautyWell is to make all processes simple for you.
//         </p>

//         <ul className="space-y-4 list-disc list-inside">
//           {aboutUsContent.map((item, index) => (
//             <li key={index}>
//               <strong>{item.title}:</strong> {item.description}
//             </li>
//           ))}
//         </ul>
//       </div>
//     </>
//   );
// };

// export default AboutUsClient;
