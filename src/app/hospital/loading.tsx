import LottieLoading from '@/components/atoms/LottieLoading';

export default function Loading() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <LottieLoading size={200} />
    </div>
  );
}
