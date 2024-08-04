"use client";

import { useRouter } from "next/navigation";
import { ROUTE } from "@/router";
import Button from "@/components/atoms/button";
import { ConfirmModal } from "@/components/template/modal";
import useModal from "@/hooks/useModal";


const SignUpButton = () => {
  const router = useRouter();

  const { handleOpenModal, open } = useModal();

  const handleConfirm = () => {
    router.push(ROUTE.SIGN_UP);
  };

  return (
    <>
      <Button
        variant="outline"
        color="blue"
        onClick={(e) => {
          e.preventDefault();
          handleOpenModal();
        }}
      >
        SIGN UP
      </Button>

      <ConfirmModal
        open={open}
        title="Policy and Terms"
        onCancel={handleOpenModal}
        onConfirm={handleConfirm}
      >
        <p style={{ whiteSpace: "pre-line", textAlign: "left"}}>
Miracle3Day are committed to protecting and respecting your personal data privacy and complying with data protection principles and provisions under applicable laws.
<br /><br />


We may collect, process, use and disclose your information when you use this website www.miracle3day.com and/or the Miracle3Day App (together, 'Miracle3Day Platform') and the services offered by Miracle3Day or the third party operators (the 'Operators') through Miracle3Day Platform (the 'Services') as described in this Privacy Policy. 'You' and 'your' when used in this Privacy Policy includes any person who accesses Miracle3Day Platform or use the Services.
<br /><br />


This Privacy Policy sets out the basis and terms upon which Miracle3Day collects, processes, uses and/or discloses your information that is obtained from you when you access Miracle3Day Platform and/or use the Services. Such information may include personal information relating to or linked to a specific individual such as name, residential address, telephone number, email address, travel document information, vehicle rental information, insurance information, age, date of birth, or any such information we have requested and you have provided through Miracle3Day Platform ('Personal Information').
<br /><br />

Please read this Privacy Policy carefully. By visiting Miracle3Day Platform, you are consenting to the collection, processing, usage and disclosure of your Personal Information as set out in this Privacy Policy.
<br /><br />
<br /><br />



SCOPE OF TERMS
<br /><br />

Miracle3Day reserves the right to update, amend or modify the terms of this Privacy Policy or any part of it without prior notice, and your continued access of Miracle3Day Platform or use of the Services signifies your acceptance of the updated, amended or modified Privacy Policy, unless if the changes reduce your rights in which case we will ask for your consent. If you do not agree to all the terms and conditions in this Privacy Policy and/or any subsequent updates, amendments or modifications thereto, you must stop accessing or otherwise using Miracle3Day Platform and the Services.
<br /><br />

Accordingly, please visit this page if you wish to access and view the current version of this Privacy Policy.
<br /><br />
<br /><br />



COLLECTION OF INFORMATION
<br /><br />

We may collect Personal Information about you that you provide to us while using Miracle3Day Platform and information about how you use Miracle3Day Platform including when you open your user account ('User Account'), visit Miracle3Day Platform or make reservations, rentals and/or bookings or international shopping for any intended Services or using the Services. Providing your Personal Information to Miracle3Day is always on a voluntary basis. However, we might not be able to provide you with certain Services if you choose not to give us your Personal Information. For example, we cannot open your user account or make reservations, rentals and/or bookings for you if we do not collect your name and contact details. For another example, we cannot ship products from Republic of Korea without your personal custom number.
<br /><br />

1. Opening Your User Account When you open with us a User Account or amend any information of your User Account, we may collect your Personal Information, such as your name, email address, username, password and telephone number.
<br /><br />

2. Visit Miracle3Day Platform, Making Reservations, Rentals, and/or Bookings, and/or International Shopping for the Services or Using the Services:
<br /><br />

When you visit Miracle3Day Platform (even you have not registered an User Account or logged in), make reservations, rentals, and/or bookings for any intended Services or use the Services, we may collect and process certain information (which may contain your Personal Information or may contain non-personally identifiable information but nevertheless linked to your Personal Information) including but not limited to those set out below. The information will be stored until you withdraw your Miracle3Day account (Will be abided by the law)
<br /><br />

1. Copies of correspondence (whether by e-mail, instant or personal messaging or otherwise) between you and us, and between you and the Operators;
<br /><br />

2. Information necessary to fulfill your reservations, rentals, and/or bookings or purchasing of products with us and our Operators (including but not limited to travel document information, vehicle rental information, insurance information, age, and date of birth, ID number needed for customs, delivery address);
<br /><br />

3. Details of your usage of Miracle3Day Platform (including traffic data, location data and length of user sessions);
<br /><br />

4. Feedback on and responses to surveys conducted by Miracle3Day relating to the Services and newsletters which may be published, circulated or distributed by Miracle3Day;
<br /><br />

5. Information automatically collected and stored in our server or the server of our third party services provider by using or accessing to Miracle3Day Platform (including the log-in name and password for your User Account, your computers Internet Protocol (IP) address, browser type, browser information, device information (including unique device identifier), pages visited, previous or subsequent sites visited).
<br /><br />

6. When you use your mobile devices to visit Miracle3Day Platform, we may collect information about you and your mobile device as stated above. This can include location information if you have consented and configured your mobile device to send us such information or upload photos with location information to Miracle3Day Platform. Such location information will be used in the ways and for the purposes as stated in this Privacy Policy. For example, we may use your location to suggest nearby Services during your travel or provide personalized content. You can change your mobile device’s privacy settings at any time to deactivate the function of sharing location information. Please note some features of Miracle3Day Platform may be affected if you turn off such location sharing function. Should you have any enquiries about your mobile devices’ privacy settings, we recommend you contacting your mobile services provider or the manufacturer of your device.
<br /><br />

If you make reservations, rentals, and/or bookings and/of purchase for other individuals through the Miracle3Day Platform, we may request personal information about such individual. You must obtain all requisite consent of such individuals and ensure they are aware of, understand and accept this Privacy Policy prior to providing their personal data to Miracle3Day.


<br /><br />
<br /><br />

STORAGE OF INFORMATION
<br /><br />

The Personal Information and other data we collect from you may be transferred to, processed, and stored in our servers or the servers of our third party services providers. Your Personal Information will be stored as long as is necessary to fulfil any of the purposes described in this Privacy Policy, or to comply with any (i) contractual requirement that are necessary for the provision of the Services, and (ii) legal, tax or accounting requirement.
<br /><br />

1. When it is no longer necessary for us to process your Personal Information, we will either delete or anonymise the data or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information.
<br /><br />

2. We will endeavor to anonymise or aggregate your data if we intend to use it for analytical purposes or trend analysis.
<br /><br />

3. Miracle3Day will use reasonable endeavours to maintain appropriate physical, electronic and organisational procedures to ensure that your Personal Information and other data is treated securely and in accordance with this Privacy Policy, and to protect such data against unauthorized access or unauthorized alteration, disclosure or destruction of data.
<br /><br />

4. Once we have received your information, we will use strict procedures and security features to try to prevent unauthorized access. Miracle3Day does not give any representation, warranty or undertaking that the Personal Information you provide to us will be secure at all times, and to the extent Miracle3Day has fulfilled its obligations under no circumstances shall Miracle3Day be responsible for any losses, damages, costs and expenses which you may suffer or incur arising from unauthorised access to or use of your Personal Information.
<br /><br />

5. All payment transactions carried out by us or our chosen third-party provider of payment processing services will be encrypted using online encryption technology. You are responsible for keeping your chosen password confidential and not to share your password with any third party.

<br /><br />
<br /><br />


USAGE OF INFORMATION
<br /><br />

1. We process the Personal Information collected in as far as necessary for performance of the contract with and providing services to you. Besides, we process the other Personal Information collected on the basis of our legitimate interests, which are the further improvement of the services and for direct marketing purposes.
<br /><br />

2. For example, Miracle3Day will use Personal Information and other data collected through Miracle3Day Platform or when making purchases for the Services to create your User Account, to fulfil your reservations, rentals, and/or bookings for the Services, to provide you with the Services, to continually improve Miracle3Day Platform and the Services, and to contact you in relation to the Services. This includes using your Personal Information or such other data to achieve faster purchase requests, better customer support and to provide you with timely notice of new Services and special offers.
<br /><br />

3. From time to time, we may also make use of your Personal Information to contact you for feedback on your use of Miracle3Day Platform, to assist us in improving Miracle3Day Platform, or to offer special savings or promotions to you, where you have indicated your consent to receiving such communications. If you would prefer not to receive notices of special savings or promotions, you may simply opt-out from receiving them by replying to us through the hyperlink provided in these notices.
<br /><br />
<br /><br />



DISCLOSURE OF INFORMATION
<br /><br />

We may from time to time share and disclose your Personal Information and other data to third parties, some of whom may be located outside your home country. The circumstances under which such sharing and disclosure will take place may include without limitation, the following:
<br /><br />

1. To successfully complete your reservations, rentals, and/or bookings, and/or purchase or to otherwise implement our Terms of Use. We may share your information with Operators or third parties (including but not limited to tour operators, activity providers, restaurants, shops, transportation companies, railway companies, cruise companies, amusement parks, telecommunication network operators, hotels, car rental companies, insurance companies, etc.), both within and outside your home country, who deliver or provide goods and services or otherwise act on our behalf.
<br /><br />

2. If you are a visitor, to the relevant Operator in connection with a Services which you have made reservations, rentals, and/or bookings for or intend to make reservations, rentals, and/or bookings for.
<br /><br />

3. If you are an Operator, to any visitor in connection with the Services you are offering.
<br /><br />

4. To our third party service providers (including Google Analytics), which we engage amongst others for the performance of certain services on our behalf, such as web hosting services, data analysis, marketing, market research, and to otherwise provide you with customer service.
<br /><br />

5. If and to the extent required by any applicable law, order of court or requests by any governmental authority to make such disclosure.
<br /><br />

6. Within the Miracle3Day group of companies. In case of a corporate transaction, in connection with the sale, merger, acquisition, or other corporate reorganization or restructuring of our corporation, your Personal Information may be disclosed, shared or transferred to the new controlling entity or its authorized third party for carrying on our business.
<br /><br />

7. To our advisors, agencies or other parties concerned in order to protect the rights and property of Miracle3Day.
<br /><br />

8. In any other case, to any third parties with your prior written consent (and in which case we will make it possible for you to withdraw your consent as easily as it was to provide consent).
<br /><br />

9. Any reviews that you post on Miracle3Day will be considered for use as content for marketing purposes by Miracle3Day.
<br /><br />

We may also share aggregate or anonymous information with relevant third parties, including our advertisers. Such information does not contain any Personal Information and will not identify you personally. However, in some occasions, these third parties may possess information about you or obtain your information from other sources. When they combine such information with our aggregate information, they may be able to identify you personally.
<br /><br />

There may be links present on Miracle3Day Platform which could result in you leaving Miracle3Day Platform and/or being taken to other third party websites. You should note that any Personal Information that you provide to these third party websites are not subject to this Privacy Policy, and Miracle3Day is not liable for any losses, damages, costs or expenses which you may suffer or incur in connection with you providing or making available Personal Information or other data to such third party websites.
<br /><br />
<br /><br />



INSURANCE
<br /><br />

You need to agree to a separate group agreement when you sign up for insurance services.


<br /><br />
<br /><br />

COOKIES
<br /><br />

Cookies are widely used in order to make websites work, or work more efficiently. When you visit our Website, we collect some of your Personal Information transmitted to us by your browser via cookies. This enables you to access Miracle3Day Platform and helps us to create better user experience for you.

<br /><br />
<br /><br />


YOUR RIGHTS
<br /><br />

You may at all times access, correct or erase your Personal Information through Miracle3Day Platform via the user portal, under “My Account”. Alternatively, you may make your data access, correction or erasure request by sending your request by email at 3daymiracle0@gmail.com
<br /><br />

Where mandatory under applicable legislation, you may also request restriction of processing of your Personal Information or object to processing by sending your request or objection by email at help@Miracle3Day.com. You may also request a copy of the information that we hold about you by sending your request by email at 3daymiracle0@gmail.com
<br /><br />

Please contact us via the contact details mentioned below if you have a complaint regarding the processing of your Personal Information.
<br /><br />

When handling any of these requests described above, we have the right to check the identity of the requester to ensure that he/she is the person entitled to make the request.

<br /><br />
<br /><br />


INQUIRIES
<br /><br />

If you have any questions about this Privacy Policy, please contact us by email at 3daymiracle0@gmail.com
<br /><br />

Last updated on: 4th August, 2024

        
        </p>
      </ConfirmModal>

    </>
  );
};

export default SignUpButton;
