import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import GuidePage from './GuidePage';
import { type ReactNode } from 'react';


const MockedThemeProvider = ({ children }: { children: ReactNode }) => {
  const theme = createTheme();
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
};

const renderComponent = () => {
  render(
    <MemoryRouter>
      <MockedThemeProvider>
        <GuidePage />
      </MockedThemeProvider>
    </MemoryRouter>
  );
};

describe('GuidePage', () => {
  test('should render initial content with the "Primeiros Passos" tab active', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: /guia de uso/i })).toBeInTheDocument();
    expect(screen.getByText(/este guia foi criado para ajudar novos usuários/i)).toBeInTheDocument();

    const gettingStartedTab = screen.getByRole('tab', { name: /primeiros passos/i });
    expect(gettingStartedTab).toHaveAttribute('aria-selected', 'true');

    const gettingStartedContent = screen.getByRole('heading', { name: /bem-vindo ao uspshare/i });
    expect(gettingStartedContent).toBeInTheDocument();
  });

  test('should switch to the "Compartilhando" tab and display its content when clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const uploadingTab = screen.getByRole('tab', { name: /compartilhando/i });
    const gettingStartedContent = screen.getByRole('heading', { name: /bem-vindo ao uspshare/i });

    expect(uploadingTab).toHaveAttribute('aria-selected', 'false');
    expect(gettingStartedContent).toBeVisible();

    await user.click(uploadingTab);

    expect(uploadingTab).toHaveAttribute('aria-selected', 'true');

    const uploadingContent = await screen.findByRole('heading', { name: /compartilhando materiais/i });
    expect(uploadingContent).toBeVisible();
    
    expect(gettingStartedContent).not.toBeVisible();
  });

  test('should switch to the "Buscando" tab and display its content when clicked', async () => {
    const user = userEvent.setup();
    renderComponent();

    const searchingTab = screen.getByRole('tab', { name: /buscando/i });
    await user.click(searchingTab);

    expect(await screen.findByRole('heading', { name: /encontrando materiais/i })).toBeVisible();
  });

  test('should have a link to the FAQ page in the info alert', () => {
    renderComponent();

    const alertBox = screen.getByRole('alert');
    const faqLink = within(alertBox).getByRole('link', { name: /perguntas frequentes/i });

    expect(faqLink).toBeInTheDocument();
    expect(faqLink).toHaveAttribute('href', '/faq');
  });
});