import dynamic from 'next/dynamic';

const SignUpMoreInfoForm = dynamic(() => import('./SignUpMoreInfoForm'), {
  ssr: false,
});


export default function CompleteProfilePage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <SignUpMoreInfoForm />
    </div>
  );
}
