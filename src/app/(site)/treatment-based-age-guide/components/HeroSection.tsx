import Image from "next/image";

interface HeroSectionProps {
  title: string;
  subtitle: string;
  heroImage?: string;
}

export function HeroSection({ title, subtitle, heroImage }: HeroSectionProps) {
  return (
    <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/20">
      {heroImage && (
        <div className="relative h-64 md:h-[30rem] w-full">
          <Image
            src={heroImage}
            alt={title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 text-white">
              {title}
            </h2>
            <p className="text-white/90 text-lg md:text-xl max-w-3xl">
              {subtitle}
            </p>
          </div>
        </div>
      )}
      
      {!heroImage && (
        <div className="p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {title}
          </h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
      )}
    </div>
  );
}