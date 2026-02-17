import { expect, test } from '@playwright/test';
import {
  completeStep1,
  completeStep3,
  mockKakaoLocal,
  mockRecommend,
  moveToStep3WithRemote,
} from './helpers/onboarding-audit';

test.describe('Onboarding UI/UX guide checks', () => {
  test.beforeEach(async ({ page }) => {
    await mockRecommend(page);
    await mockKakaoLocal(page);
  });

  test('Step1 카드가 이모지 기반으로 렌더링된다', async ({ page }) => {
    await page.goto('/search');
    await expect(page.getByText('🏠')).toBeVisible();
    await expect(page.getByText('🏢')).toBeVisible();
    await expect(page.getByText('🔑')).toBeVisible();

    const emojiSize = await page
      .getByText('🏠')
      .first()
      .evaluate((node) => {
        const style = getComputedStyle(node);
        return Number.parseFloat(style.fontSize);
      });
    expect(emojiSize).toBeGreaterThanOrEqual(48);
  });

  test('Step2 주소검색 오버레이가 라벨/2계층 결과를 표시한다', async ({ page }) => {
    await completeStep1(page);

    await page.getByRole('button', { name: /직장 1 \(필수\)/ }).click();
    await expect(page.getByText('직장 주소', { exact: true })).toBeVisible();
    await expect(page.getByPlaceholder('직장 주소를 검색해주세요')).toBeVisible();

    await page.getByPlaceholder('직장 주소를 검색해주세요').fill('금천');
    await expect(page.getByText('자동 제안')).toBeVisible();
    await expect(page.getByText('장소 결과')).toBeVisible();
  });

  test('Step3 금액 입력 UI는 빠른 버튼과 00 키를 제공한다', async ({ page }) => {
    await moveToStep3WithRemote(page);

    await expect(page.getByRole('button', { name: '+1,000만' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+5,000만' })).toBeVisible();
    await expect(page.getByRole('button', { name: '+1억' })).toBeVisible();
    await expect(page.getByRole('button', { name: '00', exact: true })).toBeVisible();
  });

  test('Step4 생활권 선택은 최대 3개로 제한된다', async ({ page }) => {
    await completeStep3(page);

    await page.getByRole('button', { name: '강남권' }).click();
    await page.getByRole('button', { name: '여의도권' }).click();
    await page.getByRole('button', { name: '판교권' }).click();
    await page.getByRole('button', { name: '마곡권' }).click();

    await expect(page.getByText('3/3')).toBeVisible();
  });

  test('핵심 CTA의 터치 영역이 44px 이상이다', async ({ page }) => {
    await completeStep1(page);

    const nextButton = page.getByRole('button', { name: '다음' });
    const box = await nextButton.boundingBox();
    expect(box).not.toBeNull();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});
