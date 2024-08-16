import PageHeader from "@/components/molecules/header/page-header";

import { Metadata } from "next";


export const metadata: Metadata = {
  title: "BeautyU | AboutUs",
};

const AboutUsPage = () => {
  return (
    <>
      <PageHeader name="About Us" />
      <p>
      <br />
      Purpose of BeuatyU is to make all process simple for you.
      <br /><br />
      1) Reservation : 
      <br />
        users can search and make reservation(clinics and plastic surgery).
        <br />
        BeautyU provide information of Beauty specialist’s profile and service they offer.
        <br />
        BeuatyU make all this process simple.
        <br /><br />
        2) Information : BeautyU provide newly beauty trend, make-up tips, skin-care methods and other useful informations.
        <br />
        Popular beauty celebrity can provide ideal products, tips and know-how in BeautyU . Users can make there own decision based on informations beauty experts directly provide.
        <br /><br />
        3) Cummunation : Users can share their vivid experience and know-hows. Users can communicate and share their various knowledge within BeautyU.
        <br /><br />
        4) Events and Discounts : BeautyU provide newly events and various information of discounts. BeautyU also provide gifts for users.
        <br /><br />
        5) Customized for individuals : BeautyU provide customized information based on their interest and perference.
        <br /><br />
        6) Channel : BeautyU connect to channel directly to hospitals and clinics. Users can ask what they are curious about.
        <br />
    </p>
    </>
  );
};

export default AboutUsPage;
