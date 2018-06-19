module.exports = function (config) {
    config.set({
        frameworks: ['mocha', 'chai'],
        files: [
            'build/rollupTest/test-all.js'
        ],
        reporters: ['mocha', 'junit'],
        colors: true,
        logLevel: config.LOG_INFO,
        browsers: ['ChromeHeadlessNoSandbox'],
        customLaunchers: {
            ChromeHeadlessNoSandbox: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox']
            }
        },
        autoWatch: false,
        singleRun: true,
        browserNoActivityTimeout: 100000,  // 10000
        captureTimeout: 100000,  // 60000
        browserDisconnectTolerance: 1,  // 0
        browserDisconnectTimeout: 5000,  // 2000
        processKillTimeout: 5000,  // 2000

        junitReporter: {
            outputDir: './build/test-results/',
            outputFile: 'TEST-Frontend.xml',
            useBrowserName: true
        }
    })
}
