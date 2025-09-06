"use client";

import React from "react";

type Testimonial = {
  name: string;
  country: string;
  flag: string;
  review: string;
};

const testimonials: Testimonial[] = [
  {
    name: "Olivia",
    country: "US",
    flag: "🇺🇸",
    review: "There was anxiety to choose from abroad, but I was convinced that the doctor reviewed it himself."
  },
  {
    name: "Lin", 
    country: "CN",
    flag: "🇨🇳",
    review: "The price comparison of other hospitals was also visible, and the reservation process was simple, so there was no language problem."
  },
  {
    name: "Olivia",
    country: "CA", 
    flag: "🇨🇦",
    review: "The whole process was so easy, from visiting hospitals, making consultation appointments and follow-up care. It&apos;s a perfect service for people like me who don&apos;t have time!"
  }
];

export default function MiddleSection3() {
  return (
    <section className="w-full py-16 px-4  bg-[#F1F2F4]">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-pink-400 text-sm font-medium mb-4 tracking-wide">
            Real Experiences
          </p>
           
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            What Our Clients Say
          </h2>
        </div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-6 shadow-sm"
            >
              {/* Name and Flag */}
              <div className="flex items-center gap-2 mb-4">
                <h3 className="font-semibold text-gray-900 text-lg">
                  {testimonial.name}
                </h3>
                <span className="text-xl">
                  {testimonial.flag}
                </span>
              </div>
              
              {/* Review Text */}
              <p className="text-gray-600 text-sm leading-relaxed">
                {testimonial.review}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}