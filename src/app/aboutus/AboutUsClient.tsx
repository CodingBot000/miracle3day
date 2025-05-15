"use client";

import PageHeader from "@/components/molecules/PageHeader";
import { aboutUsContent } from "./aboutUsContent";

const AboutUsClient = () => {
  return (
    <>
      <PageHeader name="About Us" />
      <div className="mx-5 whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
        <p className="mb-4">
          The purpose of BeautyLink is to make all processes simple for you.
        </p>

        <ul className="space-y-4 list-disc list-inside">
          {aboutUsContent.map((item, index) => (
            <li key={index}>
              <strong>{item.title}:</strong> {item.description}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default AboutUsClient;
