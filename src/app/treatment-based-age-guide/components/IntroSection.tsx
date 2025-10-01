interface IntroSectionProps {
  content: string;
}

export function IntroSection({ content }: IntroSectionProps) {
  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-sm border border-white/30">
      <p className="text-gray-700 text-base md:text-lg leading-relaxed">
        {content}
      </p>
    </div>
  );
}