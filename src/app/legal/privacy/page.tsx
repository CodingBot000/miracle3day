import { privacyContent } from "@/app/contents/privacy";

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.intro.title}</h2>
      <p className="mb-4">{privacyContent.intro.content}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.scopeOfTerms.title}</h2>
      <p className="mb-4">{privacyContent.scopeOfTerms.content}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.collectionOfInfo.title}</h2>
      <p className="mb-4">{privacyContent.collectionOfInfo.content}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.storageOfInfo.title}</h2>
      <p className="mb-4">{privacyContent.storageOfInfo.content}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.usageOfInfo.title}</h2>
      <p className="mb-4">{privacyContent.usageOfInfo.content}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.disclosureOfInfo.title}</h2>
      <p className="mb-4">{privacyContent.disclosureOfInfo.content}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.insurance.title}</h2>
      <p className="mb-4">{privacyContent.insurance.content}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.cookies.title}</h2>
      <p className="mb-4">{privacyContent.cookies.content}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.yourRights.title}</h2>
      <p className="mb-4">{privacyContent.yourRights.content}</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">{privacyContent.inquiries.title}</h2>
      <p className="mb-4">{privacyContent.inquiries.content}</p>

      <p className="text-sm text-gray-500 mt-8">
        Last updated on: 13th July, 2025
      </p>
    </main>
  );
}