# 프로젝트 작업 지시서

## 1. 프로젝트 개요

이 프로젝트는 `claude code`를 VSCode에 통합하여 다른 컴퓨터에서 작업을 이어가는 작업입니다. 기존 프로젝트에서 `claude 분석` 내용을 포함한 `.claude` 폴더와 `CLAUDE.md` 파일은 이미 존재합니다. 새로운 작업 환경에서는 이 내용을 바탕으로 작업을 진행하며, `Perfect Corp.`의 **YouCam API**를 활용한 **AI 피부 분석**을 구현할 예정입니다.

## 2. 사용해야 할 API
- 발급받은 API 키는 YouCam OnlineEditor API Key와 Secret Key가 있어. .env.local 과 .env.prod 에 각각 동일한 이름의로 키를 넣어두었어 필요하면 참조해서 사용해 

process.env.YOU_CAM_API_KEY
process.env.YOU_CAM_SECRET_KEY

진행중에 다른거 필요한게 있으면 나한테 요청해줘

- **YouCam API Documentation**:  
  [Perfect Corp. - YouCam API Docs](https://yce.perfectcorp.com/document/index.html)

### 2.1 인증

- 인증 방법은 아래 문서를 참조하여, API 호출을 위한 인증 절차를 진행합니다.  
  [Authentication - YouCam API](https://yce.perfectcorp.com/document/index.html#tag/Authentication)

### 2.2 AI 피부 분석

- 본 프로젝트에서는 YouCam의 **AI Skin Analysis** API를 사용하여 피부 분석 기능을 구현할 예정입니다.  
  [AI Skin Analysis - YouCam API](https://yce.perfectcorp.com/document/index.html#tag/AI-Skin-Analysis)

## 3. 작업 공간

`src/app/ai` 디렉토리 내에서 작업을 진행합니다. 해당 디렉토리에서 API 연동 및 피부 분석 관련 로직을 구현해야 합니다.

## 4. 작업 목표

1. **API 인증**  
   YouCam API 인증을 통해 필요한 토큰을 발급받고, 이를 통해 AI 피부 분석을 사용할 수 있는 환경을 구축합니다.

2. **AI Skin Analysis 기능 구현**  
   YouCam의 AI Skin Analysis API를 사용하여 사용자의 피부 분석을 처리할 수 있도록 기능을 구현합니다.

3. **반복 작업 및 테스트**  
   구현된 기능을 테스트하고, 필요시 반복 작업을 통해 안정성을 확보합니다.

4. **기타 필요 작업**  
   필요한 의존성 설치 및 설정 파일을 갱신합니다.

## 5. 참고 사항

- 프로젝트 환경이 새롭게 설정된 컴퓨터에서 이전과 동일하게 동작할 수 있도록 환경 설정을 확인해야 합니다.
- `claude` 분석 내용을 바탕으로 추가 분석이 필요할 경우, `.claude` 폴더와 `CLAUDE.md` 파일을 참조합니다.
- YouCam API는 사용량에 따라 요금이 부과될 수 있으므로, 사용 계획에 맞는 API 호출량을 관리해야 합니다.

## 6. 추가 작업

1. `src/app/ai` 디렉토리 내에 API 요청을 처리할 파일을 생성하고, `AI Skin Analysis`에 필요한 데이터 처리 로직을 작성합니다.
2. YouCam API를 사용하여 피부 분석 데이터를 받아와서, 사용자에게 알맞은 형식으로 제공할 수 있도록 합니다.

## 7. 참고 링크

- **YouCam API Documentation**:  
  [https://yce.perfectcorp.com/document/index.html](https://yce.perfectcorp.com/document/index.html)

- **Authentication**:  
  [https://yce.perfectcorp.com/document/index.html#tag/Authentication](https://yce.perfectcorp.com/document/index.html#tag/Authentication)

- **AI Skin Analysis**:  
  [https://yce.perfectcorp.com/document/index.html#tag/AI-Skin-Analysis](https://yce.perfectcorp.com/document/index.html#tag/AI-Skin-Analysis)
