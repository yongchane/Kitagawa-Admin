// Jest 테스트 환경 설정
import '@testing-library/jest-dom'

// 전역 Mock 설정 (필요 시)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// 환경 변수 설정
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3001'
process.env.NODE_ENV = 'test'
