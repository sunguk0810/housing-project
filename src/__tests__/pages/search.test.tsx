// @vitest-environment jsdom
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: vi.fn() }),
  usePathname: () => '/search',
}));

// Render StepWizard directly — SearchPage is an async server component
const { StepWizard } = await import('@/components/input/StepWizard');

describe('SearchPage', () => {
  beforeEach(() => {
    sessionStorage.clear();
    sessionStorage.setItem('hc_consent', 'true');
    mockPush.mockReset();
  });

  it('renders StepWizard with step 1', () => {
    render(<StepWizard />);
    expect(
      screen.getByRole('heading', { name: '어떤 형태의 집을 찾고 계세요' }),
    ).toBeInTheDocument();
  });

  it('renders trade type options (sale and jeonse only)', () => {
    render(<StepWizard />);
    expect(screen.getByText('매매')).toBeInTheDocument();
    expect(screen.getByText('전세')).toBeInTheDocument();
    expect(screen.queryByText('월세')).not.toBeInTheDocument();
  });

  it('advances to step 2 after trade type selection and next click', async () => {
    const user = userEvent.setup();
    render(<StepWizard />);
    const tradeGroup = screen.getByRole('radiogroup', { name: '주거 형태 선택' });
    await user.click(within(tradeGroup).getByRole('radio', { name: /매매/ }));
    await user.click(screen.getByRole('button', { name: /다음/ }));

    expect(
      await screen.findByRole('heading', {
        name: '출퇴근하는 직장 주소를 입력해주세요',
      }),
    ).toBeInTheDocument();
  });
});
