/**
 * Kitagawa 메인 사이트 페이지 재생성 유틸리티
 * Admin에서 데이터 수정 시 Kitagawa 사이트를 자동으로 업데이트
 */

interface RevalidationOptions {
  path?: string;
  tag?: string;
  type?: 'path' | 'tag';
}

interface RevalidationResult {
  success: boolean;
  path?: string;
  tag?: string;
  error?: string;
}

/**
 * Kitagawa 메인 사이트의 특정 페이지를 재생성
 * @param options - 재생성 옵션 (path 또는 tag)
 * @returns 재생성 결과
 */
export async function revalidateKitagawaPage(
  options: RevalidationOptions
): Promise<RevalidationResult> {
  try {
    const siteUrl = process.env.NEXT_PUBLIC_KITAGAWA_SITE_URL;
    const secret = process.env.KITAGAWA_REVALIDATION_SECRET;

    if (!siteUrl || !secret) {
      console.warn('[Revalidation] ⚠️ 환경 변수가 설정되지 않았습니다.');
      return {
        success: false,
        error: 'Revalidation 환경 변수가 설정되지 않았습니다.',
      };
    }

    const revalidationUrl = `${siteUrl}/api/revalidate?secret=${secret}`;

    const response = await fetch(revalidationUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: options.path,
        tag: options.tag,
        type: options.type || (options.path ? 'path' : 'tag'),
      }),
    });

    const result = await response.json();

    if (result.success) {
      console.log(
        `[Revalidation] ✅ Kitagawa 페이지 업데이트 성공: ${options.path || options.tag}`
      );
      return {
        success: true,
        path: options.path,
        tag: options.tag,
      };
    } else {
      console.error('[Revalidation] ❌ 실패:', result);
      return {
        success: false,
        error: result.message || '알 수 없는 오류',
      };
    }
  } catch (error) {
    console.error('[Revalidation] ❌ 요청 실패:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : '네트워크 오류',
    };
  }
}

/**
 * 제품 페이지 재생성
 * @param categorySlug - 카테고리 slug (예: "nc-rotary-table")
 * @param productSlug - 제품 slug (예: "ck-r")
 */
export async function revalidateProductPage(
  categorySlug: string,
  productSlug: string
): Promise<RevalidationResult> {
  const path = `/product/${categorySlug}/${productSlug}`;
  console.log(`[Revalidation] 제품 페이지 재생성 요청: ${path}`);
  return revalidateKitagawaPage({ path, type: 'path' });
}

/**
 * 카테고리 페이지 재생성
 * @param categorySlug - 카테고리 slug (예: "nc-rotary-table")
 */
export async function revalidateCategoryPage(
  categorySlug: string
): Promise<RevalidationResult> {
  const path = `/product/${categorySlug}`;
  console.log(`[Revalidation] 카테고리 페이지 재생성 요청: ${path}`);
  return revalidateKitagawaPage({ path, type: 'path' });
}

/**
 * 홈 페이지 재생성
 */
export async function revalidateHomePage(): Promise<RevalidationResult> {
  console.log('[Revalidation] 홈 페이지 재생성 요청');
  return revalidateKitagawaPage({ path: '/', type: 'path' });
}

/**
 * 태그로 여러 페이지 재생성
 * @param tag - 재생성할 태그 (예: "products", "categories")
 */
export async function revalidateByTag(tag: string): Promise<RevalidationResult> {
  console.log(`[Revalidation] 태그로 페이지 재생성 요청: ${tag}`);
  return revalidateKitagawaPage({ tag, type: 'tag' });
}

/**
 * 카테고리 정보에서 slug 추출
 * @param category - 카테고리 객체
 * @returns 카테고리 slug
 */
export function extractCategorySlug(category?: {
  mainCategory?: string;
  subCategory?: string;
  series?: string;
}): string {
  if (!category?.mainCategory) {
    return 'unknown';
  }

  return category.mainCategory
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

/**
 * 여러 페이지를 순차적으로 재생성
 * @param paths - 재생성할 경로 배열
 */
export async function revalidateMultiplePaths(
  paths: string[]
): Promise<RevalidationResult[]> {
  const results: RevalidationResult[] = [];

  for (const path of paths) {
    const result = await revalidateKitagawaPage({ path, type: 'path' });
    results.push(result);

    // 너무 빠른 연속 요청 방지 (100ms 대기)
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  const successCount = results.filter((r) => r.success).length;
  console.log(`[Revalidation] 일괄 재생성 완료: ${successCount}/${paths.length} 성공`);

  return results;
}
