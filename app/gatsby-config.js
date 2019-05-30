module.exports = {
  plugins: [
    'gatsby-plugin-typescript',

    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-layout`,
      options: {
        component: require.resolve(`./src/components/layout/layout.tsx`),
      },
    },

    'gatsby-plugin-sass',
  ],
};
