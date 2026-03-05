// Only set the default paths if no feature file is provided via CLI
const hasFeatureArg = process.argv.some(arg => arg.includes('.feature') || arg.includes('tests/features'));

export default {
  paths: hasFeatureArg ? [] : ['tests/features/**/*.feature'],
  import: ['tests/support/**/*.ts', 'tests/steps/**/*.ts'],
  publishQuiet: true,
  format: ['progress-bar', 'html:test-results/cucumber-report.html'],
  language: 'en',
};
