const colors = require('./config/colors');
const breakpoints = require('./config/breakpoints');
const safelist = require('./config/safelist');

module.exports = {
  purge: {
    content: ['./pages/**/*.{ts,tsx,js,jsx}', './components/**/*.{ts,tsx,js,jsx}'],
    safelist,
  },
  theme: {
    borderColor: (theme) => ({
      ...theme('colors'),
      DEFAULT: theme('colors.gray.300', 'currentColor'),
      'gray-250': '#DCDCDD',
    }),
    placeholderColor: (theme) => theme('colors'),
    screens: breakpoints,
    container: {
      screens: {
        sm: breakpoints.sm,
        md: breakpoints.md,
        lg: breakpoints.lg,
        xl: breakpoints.xl,
      },
    },
    extend: {
      fontFamily: {
        roboto: ["var(--font-roboto)", "Arial", "sans-serif"],
      },
      maxHeight: {
        '112': '28rem',
      },
      colors: {
        'ms-gray': '#f3f5f7',
        ...colors
      },
      objectPosition: {
        'custom-1': '10% 25%',
      },
      boxShadow: {
        card: '5px 10px #21697c',
      },
      zIndex: {
        1: '1',
        2: '2',
        '-1': '-1',
      },
      outline: {
        primary: `2px solid var(--color-primary)`,
        blue: '3px solid #b0d8e4',
        red: '3px solid #C00659',
      },

      spacing: {
        0.8: '0,888888889rem',
        58: '14.5rem',
        18: '4.5rem',
        136: '34rem',
      },
      inset: {
        '-81': '-22rem',
        30: '7.55rem',
      },
      minWidth: {
        '110px': '110px',
      },
      lineHeight: {
        '22px': '22px',
        '23px': '23px',
        '24px': '24px',
        '26px': '26px',
        '28px': '28px',
        '30px': '30px',
        '32px': '32px',
        '34px': '34px',
        '35px': '35px',
        '36px': '36px',
        '38px': '38px',
        '42px': '42px',
        '48px': '48px',
        '52px': '52px',
        '54px': '54px',
        '56px': '56px',
      },
      fontSize: {
        '12px': '12px',
        '14px': '14px',
        '16px': '16px',
        '18px': '18px',
        '20px': '20px',
        '22px': '22px',
        '24px': '24px',
        '26px': '26px',
        '28px': '28px',
        '30px': '30px',
        '32px': '32px',
        '34px': '34px',
        '40px': '40px',
        '44px': '44px',
        '45px': '45px',
        '48px': '48px',
        '50px': '50px',
        '60px': '60px',
      },
      screens: {
        xs: "480px", // Adding a custom 'xs' breakpoint
      },
    },
  },
  plugins: [require('@tailwindcss/line-clamp')],
};
