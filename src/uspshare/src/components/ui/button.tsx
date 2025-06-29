import * as React from 'react';
import { forwardRef } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps } from 'react-router-dom';
import { Link as MuiLink, LinkProps as MuiLinkProps } from '@mui/material';
import { LoadingButton, LoadingButtonProps } from '@mui/lab';

export interface ButtonProps extends LoadingButtonProps {
  to?: RouterLinkProps['to'];
  href?: MuiLinkProps['href'];
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ to, href, ...rest }, ref) => {
    
    if (to) {
      return (
        <LoadingButton
          ref={ref}
          component={RouterLink}
          to={to}
          {...rest} 
        />
      );
    }

    if (href) {
      return (
        <LoadingButton
          ref={ref}
          component={MuiLink}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          {...rest}
        />
      );
    }

    return (
      <LoadingButton
        ref={ref}
        {...rest}
      />
    );
  }
);

Button.displayName = "Button"; 