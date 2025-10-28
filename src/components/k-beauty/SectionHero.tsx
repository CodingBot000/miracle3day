import Image from "next/image";
import BackButton from "../common/BackButton";


interface Props {
  title: string;
  subtitle: string;
  tagline: string;
  backgroundImage: string;
}

export default function SectionHero({
  title,
  subtitle,
  tagline,
  backgroundImage
}: Props) {
  return (
    <section className="relative h-[60vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundImage}
          alt={title}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content - positioned at 1/3 from top (66% from top = 2/3 down) */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 z-10 text-center text-white mt-[50vh]">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
          {title}
        </h1>
        <p className="text-xl sm:text-xl md:text-2xl font-bold mb-3" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
          {subtitle}
        </p>
        <p className="text-base sm:text-lg md:text-xl text-gray-200 italic max-w-3xl mx-auto" style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}>
          {tagline}
        </p>
      </div>
    </section>
  );
}
