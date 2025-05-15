
import { Chip } from "@/components/atoms/Chip";
import styles from "./event-detail.module.scss";
import { getEventDetailAPI } from "@/app/api/event/[id]";
import LoadingSpinner from "@/components/atoms/loading/LoadingSpinner";
import Link from "next/link";
import { ROUTE } from "@/router";

import { daysYMDFormat } from "@/utils/days";

import { ResolvingMetadata, Metadata } from "next";
import { PriceDisplay } from "@/components/common/PriceDisplay";
import { formatDate } from "@/app/utils/date/formatDate";
import Image from "next/image";
import ImageAutoRatioComp from "@/components/common/ImageAutoRatioComp";

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data } = await getEventDetailAPI({ id: params.id });

  const previousImages = (await parent).openGraph?.images || [];

  const event = data[0];

  return {
    title: `${event.id_hospital.name} | ${data[0].name}`,
    description: event.description,
    openGraph: {
      images: [...data[0].imageurls, ...previousImages],
    },
  };
}

interface EventDetailPageProps {
  params: { id: string };
}

const EventDetailPage = async ({ params: { id } }: EventDetailPageProps) => {
  const { data } = await getEventDetailAPI({ id });

  if (!data) return <LoadingSpinner backdrop />;

  const eventData = data[0];
  const hospitalData = data[0].id_hospital;
  const surgeryData = data[0].id_surgeries;
  const title = eventData.name;
  const dateFrom = eventData.date_from;
  const dateTo = eventData.date_to;
  const price = data[0].price;
  const desc = eventData.description;
  console.log(`qq qq EventDetailPage 
    id:${id}\n
    eventData:${eventData}\n
    hospitalData:${hospitalData}\n
    surgeryData:${surgeryData}\n
    title:${title}\n
    dateFrom:${dateFrom}\n
    dateTo:${dateTo}\n
    price:${price}\n
    desc:${desc}\n
    `);

  return (
    <main>
      <section className={styles.section}>

        {/* <div className="w-full rounded-lg overflow-hidden border bg-white"> */}
          {/* <Image
            src={eventData.imageurls[0]}
            alt={eventData.name}
            width={768}
          layout="intrinsic"
         className="w-full h-auto object-contain"
          /> */}

        <ImageAutoRatioComp
          src={eventData.imageurls[0]}
          alt={eventData.id_unique.toString()}
          objectFit="cover"
          showSkeleton={true}
          fallbackText="can't load image"
          className="shadow-md"
        />
        {/* </div> */}
        <div className="p-4 flex flex-col gap-1 text-sm md:min-h-[140px]">
          <h3 className="font-bold text-xl leading-tight">{title}</h3>
          <div className={styles.info}>
            <time className="text-gray-500 text-sm mb-1">
            {formatDate(dateFrom, { formatString: "PPP", locale: "en" })} ~ {formatDate(dateTo, { formatString: "PPP", locale: "en" })}
              </time>
          </div>
          <PriceDisplay price={price} />
          <div className={styles.surgical}>
          <h2>Surgeries Package</h2>
          <ul className={styles.surgical_ul}>
            {surgeryData.map(({ id_unique, name }) => (
              <li key={id_unique}>
                <Chip>{name}</Chip> 
              </li>
            ))}
          </ul>
        </div>
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{desc}</p>
      </div>

        {/* <div className={styles.info}>
          <h1>{eventData.name}</h1>
          <p>
            {daysYMDFormat(eventData.date_from)} ~
            {daysYMDFormat(eventData.date_to)}
          </p>
        </div> */}

        {/* <div className={styles.surgical}>
          <h2>Surgeries Package</h2>
          <ul className={styles.surgical_ul}>
            {surgeryData.map(({ id_unique, name }) => (
              <li key={id_unique}>
                <Chip>{name}</Chip>
              </li>
            ))}
          </ul>
        </div> */}

        {/* <div>{eventData.description}</div> */}

        <div className="flex items-start gap-4">
        <div className="relative w-full max-w-[300px] aspect-[16/9] rounded-lg overflow-hidden border">
          <Image
            src={hospitalData.imageurls[0]}
            alt={hospitalData.name}
            fill
            className="object-cover object-center"
          />
        </div>

          <div className="flex-1 text-right">
            <p className="p-4 text-base font-medium">{hospitalData.name}</p>
            <div className="flex justify-end p-4">
              <Link
                href={ROUTE.HOSPITAL_DETAIL("") + hospitalData.id_unique}
                className="text-blue-600 underline hover:text-blue-800"
              >
                병원보기
              </Link>
            </div>
          </div>
        </div>

        {/* <div className={styles.hospital}>
          <div className={styles.hospital_img}>
          <div className="rounded-lg overflow-hidden border bg-white">
            <Image
              src={hospitalData.imageurls[0]}
              alt={hospitalData.id_unique.toString()}
              width={300}
              height={100}
              className="object-contain"
            />
          </div>

          </div>
          <div className={styles.hospital_info}>
            <p>{hospitalData.name}</p>
            <div className={styles.hospital_link}>
              <Link href={ROUTE.HOSPITAL_DETAIL("") + hospitalData.id_unique}>
                병원보기
              </Link>
            </div>
          </div>
        </div> */}
      </section>
    </main>
  );
};

export default EventDetailPage;
