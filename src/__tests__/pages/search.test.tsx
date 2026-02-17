// @vitest-environment jsdom
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => '/search',
}));

// Must import after mocks
const { default: SearchPage } = await import('@/app/(main)/search/page');

describe('SearchPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('hc_consent', 'true');
    mockPush.mockReset();
  });

  it('renders StepWizard with step 1', () => {
    render(<SearchPage />);
    expect(
      screen.getByRole('heading', { name: '어떤 형태의 집을 찾고 계세요' }),
    ).toBeInTheDocument();
  });

  it('renders trade type options', () => {
    render(<SearchPage />);
    expect(screen.getByText('매매')).toBeInTheDocument();
    expect(screen.getByText('전세')).toBeInTheDocument();
    expect(screen.getByText('월세')).toBeInTheDocument();
  });

  it('reveals marriage plan options after trade type selection', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    await user.click(screen.getByRole('button', { name: /매매/ }));

    expect(screen.getByText('6개월 내')).toBeInTheDocument();
    expect(screen.getByText('1년 내')).toBeInTheDocument();
    expect(screen.getByText('미정')).toBeInTheDocument();
  });

  it('auto-advances to step 2 after marriage selection', async () => {
    const user = userEvent.setup();
    render(<SearchPage />);
    await user.click(screen.getByRole('button', { name: /매매/ }));
    await user.click(await screen.findByRole('button', { name: /6개월 내/ }));

    expect(
      await screen.findByRole('heading', {
        name: '출퇴근하는 직장 주소를 입력해주세요',
      }),
    ).toBeInTheDocument();
  });
});
