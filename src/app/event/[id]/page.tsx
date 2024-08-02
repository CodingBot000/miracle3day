import { Chip } from "@/components/atoms/chip";

import ImageBox from "@/components/atoms/image";

import styles from "./event-detail.module.scss";
import { getEventDetailAPI } from "@/app/api/event/[id]";
import LoadingSpinner from "@/components/atoms/loading/spinner";
import Link from "next/link";
import { ROUTE } from "@/router";

import { daysYMDFormat } from "@/utils/days";

import { ResolvingMetadata, Metadata } from "next";

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

  return (
    <main>
      <section className={styles.section}>
        <ImageBox src={eventData.imageurls[0]} alt={eventData.name} />
        <div className={styles.info}>
          <h1>{eventData.name}</h1>
          <p>
            {daysYMDFormat(eventData.date_from)} ~
            {daysYMDFormat(eventData.date_to)}
          </p>
        </div>

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

        <div>{eventData.description}</div>

        <div className={styles.hospital}>
          <div className={styles.hospital_img}>
            <ImageBox src={hospitalData.imageurls[0]} alt={hospitalData.name} />
          </div>
          <div className={styles.hospital_info}>
            <p>{hospitalData.name}</p>
            <div className={styles.hospital_link}>
              <Link href={ROUTE.HOSPITAL_DETAIL("") + hospitalData.id_unique}>
                병원보기
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default EventDetailPage;
