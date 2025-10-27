import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params.path, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params.path, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params.path, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params.path, 'DELETE');
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  return handleRequest(request, params.path, 'PATCH');
}

async function handleRequest(
  request: NextRequest,
  pathSegments: string[],
  method: string
) {
  try {
    const path = pathSegments.join('/');
    const url = `${BACKEND_URL}/${path}`;

    console.log(`[Proxy] ${method} ${url}`);

    // 요청 바디 가져오기
    let body = null;
    let contentType = request.headers.get('content-type') || 'application/json';

    if (method !== 'GET' && method !== 'DELETE') {
      // multipart/form-data인 경우 FormData 그대로 전달
      if (contentType.includes('multipart/form-data')) {
        try {
          body = await request.formData();
        } catch (e) {
          console.error('[Proxy] FormData parse error:', e);
        }
      } else {
        // JSON인 경우
        try {
          body = await request.json();
        } catch {
          // 바디가 없는 경우
        }
      }
    }

    // 헤더 설정
    const headers: HeadersInit = {};

    // Authorization 헤더 복사
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // multipart/form-data가 아닌 경우에만 Content-Type 설정
    if (!contentType.includes('multipart/form-data')) {
      headers['Content-Type'] = 'application/json';
    }

    // 백엔드 API 호출
    const response = await fetch(url, {
      method,
      headers,
      body: body
        ? body instanceof FormData
          ? body
          : JSON.stringify(body)
        : undefined,
    });

    // 응답 데이터 가져오기
    const data = await response.json();

    console.log(`[Proxy] Response status: ${response.status}`);

    // 응답 반환
    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error: any) {
    console.error('[Proxy] Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Proxy request failed',
      },
      { status: 500 }
    );
  }
}
