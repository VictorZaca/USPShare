import { forwardRef } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';

// --- DEFINIÇÃO DOS TIPOS DE PROPS ---

// Aqui, criamos uma interface de props que aceita:
// 1. Todas as props de um LoadingButton (variant, color, size, loading, etc.).
// 2. Uma prop opcional `to` para navegação interna com React Router.
// 3. Uma prop opcional `href` para links externos.
export interface ButtonProps extends LoadingButtonProps {
  to?: RouterLinkProps['to'];
  href?: MuiLinkProps['href'];
}


// --- O COMPONENTE BUTTON ---

// Usamos React.forwardRef para que possamos passar uma 'ref' para o botão,
// o que é uma boa prática e necessário para algumas integrações do MUI.
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ to, href, ...rest }, ref) => {
    
    // Lógica para decidir qual componente renderizar:
    // 1. Se a prop 'to' for fornecida, o botão se torna um link de navegação interna.
    if (to) {
      return (
        <LoadingButton
          ref={ref}
          component={RouterLink}
          to={to}
          {...rest} // Passa todas as outras props (variant, color, children, loading, etc.)
        />
      );
    }

    // 2. Se a prop 'href' for fornecida, o botão se torna um link externo (tag <a>).
    if (href) {
      return (
        <LoadingButton
          ref={ref}
          component={MuiLink}
          href={href}
          target="_blank" // Abre links externos em uma nova aba por padrão
          rel="noopener noreferrer"
          {...rest}
        />
      );
    }

    // 3. Se nenhuma das duas for fornecida, ele se comporta como um botão normal.
    return (
      <LoadingButton
        ref={ref}
        {...rest}
      />
    );
  }
);

Button.displayName = "Button"; // Ajuda na depuração com as ferramentas de desenvolvedor do React.