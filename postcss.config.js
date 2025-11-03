import purgecss from '@fullhuman/postcss-purgecss';

const plugins = [];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    purgecss({
      content: [
        './index.html',
        './src/**/*.{js,jsx,ts,tsx,html}',
      ],
      defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
      safelist: [
        /^(hero|navbar|footer|features|pricing|testimonials|faq)/,
        /^(cta|btn|button)/,
        /^popular/,
      ],
    })
  );
}

export default { plugins };
