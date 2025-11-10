# Kitagawa Admin - Revalidation 가이드

## 📋 목차
- [개요](#개요)
- [자동 Revalidation 동작 방식](#자동-revalidation-동작-방식)
- [환경 변수 설정](#환경-변수-설정)
- [API 연동 시 주의사항](#api-연동-시-주의사항)
- [Revalidation 함수 사용법](#revalidation-함수-사용법)
- [트러블슈팅](#트러블슈팅)

---

## 개요

Kitagawa Admin에서 데이터를 수정할 때, **Kitagawa 메인 사이트(kitagawa.co.kr)**가 자동으로 업데이트되도록 **On-Demand Revalidation**이 구현되어 있습니다.

### 작동 원리

```
Admin에서 데이터 수정
  → 백엔드 API 호출 (POST/PATCH/DELETE)
  → 성공 시 Kitagawa 사이트 Revalidation API 호출
  → 10초 이내에 Kitagawa 사이트 페이지 재생성
  → 최신 데이터 반영 완료 ✅
```

---

## 자동 Revalidation 동작 방식

### 1. 제품 관련 API

| API 작업 | Revalidation 대상 | 함수 |
|---------|------------------|------|
| **제품 생성** | 카테고리 페이지 | `createProduct()` |
| **제품 수정** | 제품 상세 페이지 | `updateProduct()` |
| **제품 삭제** | 자동 갱신 (24시간) | `deleteProduct()` |
| **제품 순서 변경** | 카테고리 페이지 | `updateProductOrder()` |

### 2. 카테고리 관련 API

| API 작업 | Revalidation 대상 | 함수 |
|---------|------------------|------|
| **카테고리 생성** | 홈 페이지 | - |
| **카테고리 수정** | 카테고리 페이지 | `updateCategory()` |
| **카테고리 삭제** | 카테고리 페이지 | `deleteCategory()` |
| **카테고리 순서 변경** | 홈 페이지 | `updateCategoryOrder()` |

### 3. 홈 설정 API

| API 작업 | Revalidation 대상 | 함수 |
|---------|------------------|------|
| **메인 이미지 업로드** | 홈 페이지 | `uploadMainImage()` |
| **이미지 순서 변경** | 홈 페이지 | `updateImageOrder()` |
| **이미지 삭제** | 홈 페이지 | `deleteMainImage()` |

---

## 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 추가하세요:

```bash
# Kitagawa 메인 사이트 Revalidation API
NEXT_PUBLIC_KITAGAWA_SITE_URL=https://kitagawa.co.kr
KITAGAWA_REVALIDATION_SECRET=kitagawa_revalidation_secret_2025
```

### 환경 변수 설명

- `NEXT_PUBLIC_KITAGAWA_SITE_URL`: Kitagawa 메인 사이트 URL
- `KITAGAWA_REVALIDATION_SECRET`: Revalidation API 인증 키 (절대 노출 금지)

⚠️ **보안 주의사항**
- `KITAGAWA_REVALIDATION_SECRET`은 절대 클라이언트에 노출하지 마세요
- `.env.local` 파일은 `.gitignore`에 포함되어 있어야 합니다

---

## API 연동 시 주의사항

### ✅ POST/PATCH/DELETE API 연동 시 체크리스트

새로운 데이터 수정 API를 추가할 때 다음을 확인하세요:

#### 1. API 함수에 Revalidation 추가

```typescript
// src/api/products.ts 예시

import { revalidateProductPage, extractCategorySlug } from '@/utils/revalidation';

export const productsAPI = {
  updateProduct: async (slug: string, data: ProductUpdateRequest) => {
    // 1. 백엔드 API 호출
    const response = await axiosInstance.patch(`/api/product-admin/${slug}`, data);

    // 2. 성공 시 Revalidation 실행 ✨
    if (response.data.success && response.data.data) {
      const categorySlug = extractCategorySlug(response.data.data.category);
      await revalidateProductPage(categorySlug, slug);
    }

    return response.data;
  },
};
```

#### 2. 적절한 Revalidation 함수 선택

| 상황 | 사용할 함수 |
|------|-----------|
| 제품 상세 페이지 변경 | `revalidateProductPage(categorySlug, productSlug)` |
| 카테고리 페이지 변경 | `revalidateCategoryPage(categorySlug)` |
| 홈 페이지 변경 | `revalidateHomePage()` |
| 태그로 여러 페이지 변경 | `revalidateByTag(tag)` |
| 여러 경로 일괄 변경 | `revalidateMultiplePaths([path1, path2])` |

#### 3. 에러 처리

Revalidation 실패 시에도 Admin 작업은 성공으로 처리됩니다:

```typescript
// Revalidation은 async/await로 호출되지만 실패해도 에러를 throw하지 않음
await revalidateProductPage(categorySlug, slug); // 실패해도 계속 진행
```

---

## Revalidation 함수 사용법

### 기본 함수

#### 1. `revalidateProductPage(categorySlug, productSlug)`

제품 상세 페이지를 재생성합니다.

```typescript
import { revalidateProductPage } from '@/utils/revalidation';

// 예시: NC ROTARY TABLE > CK-R 제품 페이지
await revalidateProductPage('nc-rotary-table', 'ck-r');
```

#### 2. `revalidateCategoryPage(categorySlug)`

카테고리 목록 페이지를 재생성합니다.

```typescript
import { revalidateCategoryPage } from '@/utils/revalidation';

// 예시: NC ROTARY TABLE 카테고리 페이지
await revalidateCategoryPage('nc-rotary-table');
```

#### 3. `revalidateHomePage()`

홈 페이지를 재생성합니다.

```typescript
import { revalidateHomePage } from '@/utils/revalidation';

// 홈 페이지 재생성
await revalidateHomePage();
```

### 고급 함수

#### 4. `revalidateByTag(tag)`

특정 태그가 지정된 모든 페이지를 재생성합니다.

```typescript
import { revalidateByTag } from '@/utils/revalidation';

// 'products' 태그가 있는 모든 페이지 재생성
await revalidateByTag('products');
```

#### 5. `revalidateMultiplePaths(paths)`

여러 경로를 순차적으로 재생성합니다.

```typescript
import { revalidateMultiplePaths } from '@/utils/revalidation';

// 여러 페이지 일괄 재생성
await revalidateMultiplePaths([
  '/product/nc-rotary-table/ck-r',
  '/product/nc-rotary-table/mk-series',
  '/product/vise',
]);
```

### 유틸리티 함수

#### `extractCategorySlug(category)`

카테고리 객체에서 slug를 추출합니다.

```typescript
import { extractCategorySlug } from '@/utils/revalidation';

const category = {
  mainCategory: 'NC ROTARY TABLE',
  subCategory: '4축 표준사양',
  series: 'CK / CKR series',
};

const slug = extractCategorySlug(category); // 'nc-rotary-table'
```

---

## 트러블슈팅

### 문제 1: Revalidation이 동작하지 않음

**증상**: Admin에서 수정했는데 Kitagawa 사이트가 업데이트되지 않음

**해결 방법**:
1. 환경 변수 확인
   ```bash
   echo $NEXT_PUBLIC_KITAGAWA_SITE_URL
   echo $KITAGAWA_REVALIDATION_SECRET
   ```
2. 브라우저 콘솔에서 Revalidation 로그 확인
   ```
   [Revalidation] ✅ Kitagawa 페이지 업데이트 성공: /product/...
   ```
3. Kitagawa 사이트의 Revalidation API 확인
   ```bash
   curl -X POST "https://kitagawa.co.kr/api/revalidate?secret=YOUR_SECRET" \
     -H "Content-Type: application/json" \
     -d '{"path":"/","type":"path"}'
   ```

### 문제 2: 환경 변수가 undefined

**증상**: `process.env.KITAGAWA_REVALIDATION_SECRET`이 undefined

**해결 방법**:
1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. 개발 서버 재시작 (`npm run dev` 종료 후 재실행)
3. 환경 변수 이름 확인 (오타 체크)

### 문제 3: CORS 오류

**증상**: Revalidation API 호출 시 CORS 오류 발생

**해결 방법**:
- Revalidation은 서버 사이드에서 실행되므로 CORS 문제가 없어야 함
- 만약 발생한다면 API 함수가 클라이언트에서 직접 호출되고 있는지 확인

### 문제 4: 24시간 후에도 업데이트 안 됨

**원인**: ISR revalidate 시간이 설정되지 않았거나 너무 길게 설정됨

**해결 방법**:
- Kitagawa 사이트의 `revalidate` 설정 확인
- 기본값: 86400초 (24시간)

---

## 예제: 새로운 API 추가 시

```typescript
// src/api/products.ts

import { revalidateProductPage, extractCategorySlug } from '@/utils/revalidation';

export const productsAPI = {
  // 새로운 API: 제품 이미지 업로드
  uploadProductImage: async (slug: string, file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    // 1. 백엔드 API 호출
    const response = await axiosInstance.post(
      `/api/product-admin/${slug}/images`,
      formData
    );

    // 2. 성공 시 Revalidation ✨
    if (response.data.success && response.data.data) {
      const categorySlug = extractCategorySlug(response.data.data.category);
      await revalidateProductPage(categorySlug, slug);
      console.log(`[Image Upload] ✅ ${slug} 페이지가 10초 후 업데이트됩니다.`);
    }

    return response.data;
  },
};
```

---

## 요약

### ✅ 구현된 기능

- [x] 제품 생성/수정/삭제 시 자동 Revalidation
- [x] 카테고리 수정/삭제 시 자동 Revalidation
- [x] 메인 이미지 변경 시 자동 Revalidation
- [x] 순서 변경 시 자동 Revalidation
- [x] 에러 처리 및 로깅
- [x] 환경 변수 설정

### 📌 핵심 원칙

1. **POST/PATCH/DELETE API는 항상 Revalidation 연동**
2. **GET API는 Revalidation 불필요**
3. **Revalidation 실패해도 Admin 작업은 성공 처리**
4. **환경 변수는 절대 노출 금지**

---

**작성일**: 2025-01-06
**버전**: 1.0.0
