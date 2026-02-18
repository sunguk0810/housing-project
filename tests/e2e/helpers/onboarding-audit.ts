import type { Page } from '@playwright/test';
import kakaoFixture from '../fixtures/kakao-local.mock.json';

interface KakaoFixtureDocument {
  readonly id: string;
  readonly place_name: string;
  readonly address_name: string;
  readonly road_address_name: string;
  readonly category_group_name: string;
  readonly x: string;
  readonly y: string;
}

interface KakaoFixtureData {
  readonly documents: readonly KakaoFixtureDocument[];
}

const KAKAO_FIXTURE = kakaoFixture as KakaoFixtureData;

export async function mockRecommend(page: Page): Promise<void> {
  await page.route('**/api/recommend', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        recommendations: [
          {
            rank: 1,
            aptId: 1,
            aptName: '테스트 아파트',
            address: '서울 금천구 테스트로 1',
            lat: 37.5,
            lng: 126.9,
            tradeType: 'jeonse',
            averagePrice: 40000,
            householdCount: 500,
            areaMin: 59,
            monthlyCost: 220,
            commuteTime1: 35,
            commuteTime2: null,
            childcareCount: 12,
            schoolScore: 75,
            safetyScore: 80,
            finalScore: 82,
            reason: '테스트 데이터',
            whyNot: null,
            dimensions: {
              budget: 80,
              commute: 78,
              childcare: 74,
              safety: 81,
              school: 73,
            },
            sources: {
              priceDate: '2026-02',
              safetyDate: '2026-02',
            },
          },
        ],
        meta: {
          totalCandidates: 1,
          computedAt: new Date().toISOString(),
        },
      }),
    });
  });
}

export async function mockKakaoLocal(page: Page): Promise<void> {
  await page.route('**/api/kakao-local?*', async (route) => {
    const url = new URL(route.request().url());
    const query = (url.searchParams.get('query') ?? '').trim().toLowerCase();

    const filtered =
      query.length < 2
        ? []
        : KAKAO_FIXTURE.documents.filter((item) => {
            return (
              item.place_name.toLowerCase().includes(query) ||
              item.road_address_name.toLowerCase().includes(query) ||
              item.address_name.toLowerCase().includes(query)
            );
          });

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ documents: filtered }),
    });
  });
}

export async function completeStep1(page: Page): Promise<void> {
  await page.goto('/search');
  await page.waitForLoadState('networkidle');
  await page.getByRole('button', { name: /매매/ }).click();
  await page.getByRole('button', { name: /6개월 내/ }).click();
}

export async function moveToStep3WithRemote(page: Page): Promise<void> {
  await completeStep1(page);
  await page.getByRole('button', { name: '재택근무예요' }).first().click();
  await page.getByRole('button', { name: '다음' }).click();
}

export async function completeStep3(page: Page): Promise<void> {
  await moveToStep3WithRemote(page);
  await page.getByRole('button', { name: /보유 자산 \(현금성\)/ }).click();
  await page.getByRole('button', { name: '+1억' }).click();
  await page.getByRole('button', { name: '완료' }).click();
  await page.getByRole('button', { name: '전체 동의' }).click();
  await page.getByRole('button', { name: '다음' }).click();
}
