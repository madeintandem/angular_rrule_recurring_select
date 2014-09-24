module.exports = function(config) {
  config.set({
    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['mocha-debug', 'mocha', 'chai', 'sinon', 'jquery-1.9.1'],
    files: [
      '../bower_components/jquery/jquery.js',
      '../bower_components/angular/angular.js',
      '../bower_components/moment/moment.js',
      '../bower_components/rrule/lib/rrule.js',
      '../bower_components/angular-mocks/angular-mocks.js',
      '../bower_components/lodash/dist/lodash.js',
      '../lib/rrule_recurring_select.js',
      './unit/**/*_spec.js',
      '../template/*.html'
    ],
    watched: [
    ],
    exclude: [],
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      '../template/*.html': 'ng-html2js'
    },
    ngHtml2JsPreprocessor: {
        // If your build process changes the path to your templates,
        // use stripPrefix and prependPrefix to adjust it.
        //stripPrefix: "source/path/to/templates/.*/",
        // prependPrefix: "web/path/to/templates/",
        cacheIdFromPath: function(filepath) {
          var path = filepath.match(/(template\/.*$)/)[0];
          console.log("cached filepath: " + path);
          return path;
        },

        // the name of the Angular module to create
        moduleName: "rruleTemplates"
    },
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],
    port: 9877,
    colors: true,
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,
    autoWatch: true,
    //browsers: ['Chrome', 'Firefox', 'Safari'],
    browsers: ['PhantomJS'],
    singleRun: false
  });
};
