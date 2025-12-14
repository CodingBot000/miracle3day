import Image from "next/image";


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
    <section className="relative h-[70vh] min-h-[600px] max-h-[800px] flex flex-col items-center justify-center overflow-hidden pt-24 pb-12">
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

      {/* Content - centered and contained within image area */}
      <div className="container mx-auto px-6 sm:px-8 lg:px-12 z-10 text-center text-white max-w-5xl flex flex-col justify-center flex-1">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-8 sm:mb-10 md:mb-12 leading-tight px-4" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
          {title}
        </h1>
        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold mb-6 sm:mb-8 md:mb-10 px-4" style={{ fontFamily: "'Inter', 'Pretendard', sans-serif" }}>
          {subtitle}
        </p>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 italic max-w-3xl mx-auto px-4 leading-relaxed" style={{ fontFamily: "'Crimson Pro', 'Noto Serif KR', serif" }}>
          {tagline}
        </p>
      </div>
    </section>
  );
}
