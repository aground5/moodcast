# GEMINI.md - 프로젝트 가이드라인

이 문서는 **지역 기반 감정 동기화 플랫폼 - 무드캐스트(Moodcast)** 프로젝트의 개발 및 운영 가이드라인을 담고 있습니다. 본 프로젝트는 **한국 시장**을 타겟으로 하며, 지역적 유대감과 직관적인 감정 공유 경험을 제공하는 것을 목표로 합니다.

## 1. 아키텍처: Feature-Sliced Design (FSD)

이 프로젝트는 확장성과 유지보수성을 위해 **FSD(Feature-Sliced Design)** 아키텍처를 따릅니다. `src/` 디렉토리 내의 각 레이어는 다음과 같은 역할을 합니다:

-   **`app/`**: 애플리케이션의 진입점. 전역 스타일(`globals.css`), 레이아웃(`layout.tsx`), 라우팅 설정 등을 포함합니다.
-   **`views/`**: (구 `pages`) 실제 페이지 컴포넌트들이 위치합니다. 각 페이지는 여러 위젯을 조합하여 구성됩니다. (예: `home`, `map/view`)
-   **`widgets/`**: 페이지를 구성하는 독립적인 UI 블록입니다. (예: `Header`, `MoodMap`, `StatisticsPanel`)
-   **`features/`**: 비즈니스 가치를 전달하는 사용자 상호작용 기능입니다. (예: `vote/CastVote`, `map/FilterRegion`)
-   **`entities/`**: 비즈니스 도메인 엔티티입니다. 데이터 모델과 해당 데이터를 보여주는 단순한 UI를 포함합니다. (예: `mood`, `region`, `user`)
-   **`shared/`**: 특정 비즈니스 로직에 종속되지 않는 재사용 가능한 컴포넌트와 유틸리티입니다. (예: `ui/Button`, `lib/supabase`, `lib/api`)

### FSD 사용 규칙
1.  **단방향 의존성**: 상위 레이어는 하위 레이어를 import 할 수 있지만, 반대는 불가능합니다. (`app` -> `views` -> `widgets` -> `features` -> `entities` -> `shared`)
2.  **공개 API**: 각 슬라이스(폴더)는 `index.ts`를 통해 외부에서 사용할 컴포넌트나 로직을 명시적으로 내보내야 합니다.

## 2. 레포지토리 사용법

### 설치 및 실행
```bash
# 패키지 설치
pnpm install

# 개발 서버 실행
pnpm run dev
```

### 주요 기술 스택
-   **Framework**: Next.js 16+ (App Router)
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Package Manager**: pnpm
-   **Database**: Supabase
-   **Map**: React-Kakao-Maps-SDK (예정)

## 3. 한국 시장 준수 사항 (Korean Market Compliance)

본 서비스는 대한민국 사용자를 대상으로 하므로, 모든 콘텐츠와 법적 요구사항은 한국 기준을 따릅니다.

### 3.1 언어 (Language)
-   **기본 언어**: 한국어 (Korean)이며, 다국어 지원을 위해 `next-intl`을 사용합니다.
-   **구현 원칙**: 소스 코드 내에 한국어를 직접 작성(하드코딩)하는 것은 **엄격히 금지**됩니다.
-   **시맨틱 플레이스홀더 (Semantic Placeholders)**:
    -   모든 텍스트는 의미를 나타내는 **시맨틱 키(Semantic Key)**로 관리해야 합니다. (예: `home.welcomeMessage`)
    -   실제 텍스트는 `src/i18n/dictionaries/ko.json` 등 딕셔너리 파일에 정의합니다.

### 3.2 법적 고지 및 준수 (Legal Requirements)
-   **개인정보 처리**: 위치 정보 수집 시 반드시 사용자 동의를 받아야 하며, 수집 목적과 보유 기간을 명시해야 합니다.
-   **서비스 이용약관**: 서비스 이용에 대한 명확한 약관을 제공해야 합니다.

## 4. SEO & 검색 엔진 최적화 전략 (Google SEO)

### 4.1 메타데이터 (Metadata)
-   **Title**: `[지역명] 기분 날씨 - 무드캐스트` 형식으로 구체적인 키워드 포함.
-   **Description**: "지금 마포구의 기분은 어떨까요? 당신의 기분을 공유하고 지역 사람들과 동기화하세요." 등 클릭을 유도하는 문구 사용.
-   **Open Graph**: 소셜 공유 시 보여질 이미지(감정 지도 스냅샷 등), 제목, 설명을 최적화.

### 4.2 시맨틱 마크업 (Semantic Markup)
-   `<h1>`: 페이지 당 단 하나만 사용.
-   적절한 Heading 태그 사용으로 계층 구조 명시.
-   이미지 `alt` 태그 필수.

### 4.3 성능 (Performance)
-   지도 라이브러리는 필요한 시점에 로드(Lazy Loading)하여 초기 로딩 속도 최적화.
-   이미지 포맷 최적화(WebP).

## 5. 국제화 (Internationalization - i18n)

### 5.1 규칙 및 워크플로우
1.  **하드코딩 절대 금지**: 모든 텍스트는 `ko.json` 등 딕셔너리 파일로 관리합니다.
2.  **키 명명 규칙**: `[패키지/페이지].[섹션].[요소]` (예: `home.hero.title`).
3.  **구현**:
    -   Client Component: `useTranslations` 사용.
    -   Server Component: `getTranslations` 사용.

### 5.2 라우팅
-   `app/[locale]` 기반 라우팅.
-   `src/proxy.ts` 미들웨어를 통해 로케일 및 인증 처리.

## 6. 개발 표준 (Development Standards)

### 6.1 Next.js 권장 사항
-   `<a>` 대신 `Link` 컴포넌트 사용.
-   `<img>` 대신 `Image` 컴포넌트 사용.
-   서버 컴포넌트(RSC)를 기본으로 사용하고, 상호작용이 필요한 경우에만 `"use client"` 지시어 사용.

## 7. 핵심 기능 명세 (Core Features)

### 7.1 위치 기반 감정 공유
-   **IP/GPS 하이브리드**: 정확한 위치(GPS)와 대략적 위치(IP)를 모두 활용하여 접근성을 높입니다.
-   **실시간성**: 투표 결과는 즉시 반영되거나 짧은 주기로 갱신되어야 합니다.

### 7.2 데이터 시각화
-   단순한 수치가 아닌, 색상과 애니메이션(울렁임, 파도 등)을 통해 감정을 직관적으로 전달합니다.

## 📝 협업 및 코드 변경 내역 문서화 프로토콜

Antigravity는 코드 수정 시, 다른 에이전트가 해당 변경 사항을 즉시 파악하고 자신의 로직에 반영할 수 있도록 아래 규칙에 따라 `docs/`를 업데이트해야 합니다.

### 1. 문서 명명 규칙
- **REQ_[기능명].md**: 요구사항 발생
- **SPEC_[기능명].md**: 로직/명세 변경
- **FLOW_[프로세스명].md**: 프로세스 변경

### 2. 업데이트 절차
코드 수정 시 관련 문서를 동기화하고, 파일 상단에 `@see docs/[파일명]` 주석을 남깁니다.
