import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

export const AppPreset = definePreset(Aura, {
  primitive: {
    // Linked structural borders
    borderRadius: {
      none: '0',
      xs: '2px',
      sm: 'var(--radius-sm)',
      md: 'var(--radius-md)',
      lg: 'var(--radius-lg)',
      xl: 'var(--radius-xl)',
    },

    // Color systems mapped to CSS variables
    indigo: {
      50: 'var(--primary-50)',
      100: 'var(--primary-100)',
      200: 'var(--primary-200)',
      300: 'var(--primary-300)',
      400: 'var(--primary-400)',
      500: 'var(--primary-500)',
      600: 'var(--primary-600)',
      700: 'var(--primary-700)',
      800: 'var(--primary-800)',
      900: 'var(--primary-900)',
      950: 'var(--primary-950)',
    },

    slate: {
      50: 'var(--slate-50)',
      100: 'var(--slate-100)',
      200: 'var(--slate-200)',
      300: 'var(--slate-300)',
      400: 'var(--slate-400)',
      500: 'var(--slate-500)',
      600: 'var(--slate-600)',
      700: 'var(--slate-700)',
      800: 'var(--slate-800)',
      900: 'var(--slate-900)',
      950: 'var(--slate-950)',
    },
  },

  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}',
    },

    // Fonts and Typography controls bound to styles.css options
    fontFamily: 'var(--font-family-sans)',

    formField: {
      borderRadius: '{borderRadius.sm}',
      paddingX: 'var(--spacing-form-x)',
      paddingY: 'var(--spacing-form-y)',
      sm: {
        fontSize: 'var(--font-size-xs)',
        paddingX: '0.625rem',
        paddingY: '0.375rem',
      },
      lg: {
        fontSize: 'var(--font-size-lg)',
        paddingX: '1rem',
        paddingY: '0.75rem',
      },
    },

    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
        primary: {
          color: '{indigo.600}',
          contrastColor: '#ffffff',
          hoverColor: '{indigo.700}',
          activeColor: '{indigo.800}',
        },
        formField: {
          background: '{surface.0}',
          borderColor: '{surface.300}',
          hoverBorderColor: '{surface.400}',
          focusBorderColor: '{indigo.500}',
          invalidBorderColor: 'var(--danger-color)', // Driven dynamically
          color: '{surface.700}',
          placeholderColor: '{surface.400}',
          iconColor: '{surface.400}',
        },
        text: {
          color: '{slate.800}',
          hoverColor: '{slate.900}',
          mutedColor: '{slate.500}',
          hoverMutedColor: '{slate.600}',
        },
        content: {
          background: '{surface.0}',
          borderColor: '{surface.200}',
          color: '{text.color}',
        },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '{slate.50}',
          100: '{slate.100}',
          200: '{slate.200}',
          300: '{slate.300}',
          400: '{slate.400}',
          500: '{slate.500}',
          600: '{slate.600}',
          700: '{slate.700}',
          800: '{slate.800}',
          900: '{slate.900}',
          950: '{slate.950}',
        },
        primary: {
          color: '{indigo.400}',
          contrastColor: '#ffffff',
          hoverColor: '{indigo.300}',
          activeColor: '{indigo.200}',
        },
        formField: {
          background: '{surface.900}',
          borderColor: '{surface.700}',
          hoverBorderColor: '{surface.600}',
          focusBorderColor: '{indigo.400}',
          invalidBorderColor: 'var(--danger-color)', // Driven dynamically
          color: '{surface.0}',
          placeholderColor: '{surface.500}',
          iconColor: '{surface.400}',
        },
        text: {
          color: '{slate.100}',
          hoverColor: '{slate.50}',
          mutedColor: '{slate.400}',
          hoverMutedColor: '{slate.300}',
        },
        content: {
          background: '{surface.900}',
          borderColor: '{surface.700}',
          color: '{text.color}',
        },
      },
    },
  },

  components: {
    button: {
      root: {
        borderRadius: '{borderRadius.sm}',
        paddingX: '1.125rem',
        paddingY: '0.65rem',
        label: { fontWeight: '500' },
      },
    },
    card: {
      root: {
        borderRadius: '{borderRadius.md}',
        shadow: 'var(--shadow-card)', // Bound directly to your CSS variable
      },
      body: { padding: '1.5rem', gap: '0.75rem' },
    },
    dialog: {
      root: { borderRadius: '{borderRadius.lg}' },
    },
    tag: {
      root: {
        borderRadius: '{borderRadius.xl}',
        fontSize: 'var(--font-size-xs)', // Linked font-size token
        fontWeight: '500',
        padding: '0.2rem 0.6rem',
      },
    },
    badge: {
      root: {
        borderRadius: '{borderRadius.xl}',
        fontSize: '0.7rem',
        fontWeight: '600',
      },
    },
    panel: {
      root: { borderRadius: '{borderRadius.md}' },
    },
  },

  tabs: {
    colorScheme: {
      light: {
        tab: {
          background: 'transparent',
          hoverBackground: 'color-mix(in srgb, {indigo.500} 8%, transparent)',
          activeBackground: 'transparent',
          borderColor: 'transparent',
          hoverBorderColor: 'transparent',
          activeBorderColor: '{indigo.600}',
          color: '{slate.500}',
          hoverColor: '{slate.800}',
          activeColor: '{indigo.600}',
        },
        tablist: {
          background: 'transparent',
          borderColor: '{slate.200}',
          activeBarBackground: '{indigo.600}',
        },
        tabpanel: {
          background: 'transparent',
          color: '{slate.800}',
          padding: '0',
        },
      },
      dark: {
        tab: {
          background: 'transparent',
          hoverBackground: 'color-mix(in srgb, {indigo.400} 10%, transparent)',
          activeBackground: 'transparent',
          borderColor: 'transparent',
          hoverBorderColor: 'transparent',
          activeBorderColor: '{indigo.400}',
          color: '{slate.400}',
          hoverColor: '{slate.100}',
          activeColor: '{indigo.400}',
        },
        tablist: {
          background: 'transparent',
          borderColor: '{slate.700}',
          activeBarBackground: '{indigo.400}',
        },
        tabpanel: {
          background: 'transparent',
          color: '{slate.100}',
          padding: '0',
        },
      },
    },
  },
});
