import { expect, test } from '@playwright/test';
import {
  completeStep3,
  mockKakaoLocal,
  mockRecommend,
  moveToStep3WithRemote,
} from './helpers/onboarding-audit';

test.describe('Onboarding flow', () => {
  test.beforeEach(async ({ page }) => {
    await mockRecommend(page);
    await mockKakaoLocal(page);
  });

  test('Step1~Step5 핵심 플로우가 /results로 연결된다', async ({ page }) => {
    await completeStep3(page);

    // Step4: slider + living area + child plan
    const sliders = page.locator('input[type="range"]');
    await expect(sliders).toHaveCount(4);

    await sliders.nth(0).evaluate((el) => {
      const input = el as HTMLInputElement;
      input.value = '60';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await page.getByRole('button', { name: '강남권' }).click();
    await page.getByRole('button', { name: /계획있음/ }).click();

    const startButton = page.getByRole('button', { name: '분석 시작' });
    await expect(startButton).toBeEnabled();
    await startButton.click();

    await expect(page.getByRole('heading', { name: '분석 중입니다' })).toBeVisible();
    await expect(page).toHaveURL(/\/results/, { timeout: 15000 });
  });

  test('Step3 동의 미완료 시 CTA가 비활성화된다', async ({ page }) => {
    await moveToStep3WithRemote(page);

    const nextButton = page.getByRole('button', { name: '다음' });
    await expect(nextButton).toBeDisabled();
  });
});
