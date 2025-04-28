import { memo } from "react"

// This script runs before React hydration, preventing flash of wrong theme
export const ThemeScript = memo(() => {
  const themeScript = `
    (function() {
      try {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const storedTheme = localStorage.getItem('theme');
        
        if (storedTheme === 'dark' || (storedTheme === null && systemPrefersDark)) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error('Theme detection failed:', e);
      }
    })();
  `

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />
})

ThemeScript.displayName = "ThemeScript"
