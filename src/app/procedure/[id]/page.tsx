import { Metadata, ResolvingMetadata } from "next";
import { capitalizeWord } from "@/utils/word";
import { procedureMapper } from "@/constants";
import { getProcedureInfoAPI } from "@/app/api/surgeries/[id]/info";
import styles from "./procedure.module.scss";
import React from "react";

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `Procedure | ${capitalizeWord(params.id)}`,
    openGraph: {
      images: [...previousImages],
    },
  };
}
  
interface ProcedureDetailPageProps {
  params: {
    id: string;
  };
}

const ProcedureDetailPage = async ({
  params: { id },
}: ProcedureDetailPageProps) => {

    const formattedKey = id.toLowerCase().replace(/\s+/g, '');
    let surgery_id_unique = undefined
    // procedureMapper 배열을 순회하며 값을 찾음
    for (const procedure of procedureMapper) {
      // 각 요소의 키를 소문자로 변환하고 공백을 제거
      const procedureKey = Object.keys(procedure)[0].toLowerCase().replace(/\s+/g, '');
      
      // 입력 받은 키와 매칭되는 경우 해당 값을 반환
      if (procedureKey === formattedKey) {
        surgery_id_unique = procedure[Object.keys(procedure)[0]];
      }
    }
    // id : skinbooster
    // surgery_id_unique : 2006  surgery_info 테이블의 id_unique  procedureMapper에 의해 매핑해서 리턴함
    console.log('surgery_id_unique:',surgery_id_unique)
    if (!surgery_id_unique) {
        return (
            <main>
                <p>mappingResult : {surgery_id_unique}</p>
                <p>error {id}</p>
            </main>
          );
    }
    
    const key = id 


    const data = await getProcedureInfoAPI({ id_unique: surgery_id_unique });
   
    const type = data.data.type
    const name = data.data.name
    const imageurls = data.data.imageurls
    const description = data.data.description

    if (!imageurls || imageurls.length === 0) {
        return (
            <main>
                <p>{type}</p>
                <p>{name}</p>
                <p>{description}</p>  
            </main>
        );
    }
    
    const src = imageurls[0]
    
    return (
        <main>
            <div className={styles.header}>
                <p>{type}</p>            
            </div>
            <div className={styles.header}>
                <p>{name}</p>
            </div>
            <div className={styles.display_image}>
                <img src={src} alt={name} />
            </div>
            <br />
            <br />
            <div className={styles.description}>
            {/* <div style={{ whiteSpace: "pre-wrap"}}> */}
                {description}
            {/* {description.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                        {line}
                        <br />
                    </React.Fragment>
                ))}  */}
            </div>
        </main>
    );
};

export default ProcedureDetailPage;
