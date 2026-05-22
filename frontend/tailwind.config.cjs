module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities(
        {
          '.bg-linear-to-b': {
            'background-image': 'linear-gradient(to bottom,var(--tw-gradient-stops))',
          },
          '.bg-linear-to-br': {
            'background-image': 'linear-gradient(to bottom right,var(--tw-gradient-stops))',
          },
          '.bg-linear-to-tr': {
            'background-image': 'linear-gradient(to top right,var(--tw-gradient-stops))',
          },
          '.bg-linear-to-r': {
            'background-image': 'linear-gradient(to right,var(--tw-gradient-stops))',
          },
        },
        { variants: ['responsive', 'hover'] }
      );
    },
  ],
};
