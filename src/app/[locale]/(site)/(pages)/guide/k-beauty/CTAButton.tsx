import { Link } from '@/i18n/routing';

interface Props {
  text: string;
  link: string;
}

export default function CTAButton({ text, link }: Props) {
  return (
    <Link
      href={link}
      className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
    >
      {text} →
    </Link>
  );
}
