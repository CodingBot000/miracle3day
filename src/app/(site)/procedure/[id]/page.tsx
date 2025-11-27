import { log } from '@/utils/logger';
import { Metadata, ResolvingMetadata } from "next";
import { capitalizeWord } from "@/utils/word";
import { procedureMapper } from "@/constants";
import { getProcedureInfoAPI } from "@/app/api/surgeries/[id]/info";
import styles from "./procedure.module.scss";
import React from "react";
import ImageAutoRatioComp from "@/components/common/ImageAutoRatioComp";

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

   const formattedKey = id.toLowerCase().replace(/(\s+|%20)/g, '');
    let surgery_id_unique = undefined
    // procedureMapper 배열을 순회하며 값을 찾음
    for (const procedure of procedureMapper) {
      // 각 요소의 키를 소문자로 변환하고 공백을 제거
      const procedureKey = Object.keys(procedure)[0].toLowerCase().replace(/\s+/g, '');
      
      // log.debug('procedureKey, formattedKey:' , procedureKey, formattedKey);
      // 입력 받은 키와 매칭되는 경우 해당 값을 반환
      if (procedureKey === formattedKey) {
        surgery_id_unique = procedure[Object.keys(procedure)[0]];
      }
    }
    // id : skinbooster
    // surgery_id_unique : 2006  surgery_info 테이블의 id_unique  procedureMapper에 의해 매핑해서 리턴함
    log.debug('surgery_id_unique:',surgery_id_unique)
    if (!surgery_id_unique) {
        return (
            <main>
              <p>{id}</p>
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

    const parsedData = description.replace(/\"/g, '"');
    const descriptionArray = parsedData.split('\n')
 
    return (
      <main>
        <div className="flex justify-center items-center font-bold text-[28px] h-[60px]">
          <p>{type} Procedure</p>
        </div>
        <div className="flex justify-center items-center font-bold text-[34px] h-[60px]">
          <p>{name}</p>
        </div>
    
        <br />
        <div className="flex justify-center items-center">
          <ImageAutoRatioComp 
           src={src}
           alt={name}
           objectFit="cover"
           showSkeleton={true}
           fallbackText="can't load image"
           className="shadow-md"
          />
        </div>
        <br />
        <br />
        <div className="mx-5 whitespace-pre-wrap">
          {descriptionArray.map((line, idx) => (
            <React.Fragment key={idx}>
              {line}
              <br />
            </React.Fragment>
          ))}
                    {/* <div style={{ whiteSpace: "pre-wrap"}}> */}
                {/* {description} */}
            {/* {description.split(/
/).map((line, index) => (
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
