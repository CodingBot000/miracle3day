import PageHeader from "@/components/molecules/header/page-header";
import styles from "./aboutus.module.scss";
import { Metadata } from "next";


export const metadata: Metadata = {
  title: "BeautyLink | AboutUs",
};

const AboutUsPage = () => {
  return (
    <>
      <PageHeader name="About Us" />
      <div className={styles.description}>
        <p>
        <br />
        Purpose of BeuatyU is to make all process simple for you.
        <br /><br />
        1) Reservation : 
        <br />
          users can search and make reservation(clinics and plastic surgery).
          <br />
          BeautyLink provide information of Beauty specialist’s profile and service they offer.
          <br />
          BeuatyU make all this process simple.
          <br /><br />
          2) Information : BeautyLink provide newly beauty trend, make-up tips, skin-care methods and other useful informations.
          <br />
          Popular beauty celebrity can provide ideal products, tips and know-how in BeautyLink . Users can make there own decision based on informations beauty experts directly provide.
          <br /><br />
          3) Cummunation : Users can share their vivid experience and know-hows. Users can communicate and share their various knowledge within BeautyLink.
          <br /><br />
          4) Events and Discounts : BeautyLink provide newly events and various information of discounts. BeautyLink also provide gifts for users.
          <br /><br />
          5) Customized for individuals : BeautyLink provide customized information based on their interest and perference.
          <br /><br />
          6) Channel : BeautyLink connect to channel directly to hospitals and clinics. Users can ask what they are curious about.
          <br />
      </p>
    </div>
    </>
  );
};

export default AboutUsPage;
