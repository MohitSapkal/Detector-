import { useEffect, useState } from 'react';

/**
 * ThemeToggle – a simple button that switches between light and dark themes.
 * The current theme is stored in localStorage and reflected on the HTML element
 * via `data-theme` attribute, allowing CSS variables to adapt.
 */
export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'dark'
  );

  // Keep the HTML data attribute in sync with state
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <button className="theme-toggle" onClick={toggleTheme}>
      {theme === 'dark' ? 'Light' : 'Dark'} Mode
    </button>
  );
}
