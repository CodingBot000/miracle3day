import Image from "next/image";


interface Props {
  src: string;
  alt: string;
  caption?: string;
  aspectRatio?: 'video' | 'square' | 'portrait';
}

export default function ImageWithCaption({
  src,
  alt,
  caption,
  aspectRatio = 'video'
}: Props) {
  const aspectClasses = {
    video: 'aspect-video',
    square: 'aspect-square',
    portrait: 'aspect-[3/4]',
  };

  return (
    <figure className="my-8">
      <div className={`relative w-full ${aspectClasses[aspectRatio]} rounded-2xl overflow-hidden shadow-lg`}>
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-gray-600 mt-3 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
