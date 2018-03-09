const gulp = require('gulp')
const gulpTypescript = require('gulp-typescript')
const rollup = require('rollup')
const rollupAlias = require('rollup-plugin-alias')
const rollupReplace = require('rollup-plugin-replace')
const rollupNodeResolve = require('rollup-plugin-node-resolve')
const rollupBabel = require('rollup-plugin-babel')
const rimraf = require('rimraf')
const karma = require('karma')

const config = {
    // TypeScriptソース
    srcDir: 'src/main/typescript',
    srcTestDir: 'src/test/javascript',
    // ビルド出力先
    buildBase: 'build/typescript',
    compileDest: 'build/typescript/compile',
    rollupDest: 'build/typescript/rollup',
    rollupTestDest: 'build/typescript/rollupTest',
    test: 'build/typescript/test',
    distribution: 'dist',
    development: true
}

// 出力先をクリンナップ
gulp.task('clean', () => {
    return new Promise(() => {
        rimraf.sync(`${config.buildBase}`)
        rimraf.sync(`${config.distribution}/*`)
    })
})

// コンパイル
gulp.task('compile-typescript', () => {
    const project = gulpTypescript.createProject('tsconfig.json')
    return project.src()
                  .pipe(project())
                  .js
                  .pipe(gulp.dest(config.compileDest))
})

// rollup
gulp.task('rollup', ['compile-typescript'], () => {
    return rollup.rollup({
        input: `${config.compileDest}/vue-yar.js`,
        plugins: [
            rollupAlias({
                vue: 'node_modules/vue/dist/vue.esm.js'
            }),
            rollupBabel()
        ]
    }).then(bundle =>
        bundle.write({
            file: `${config.rollupDest}/vue-yar.js`,
            format: 'es',
            sourcemap: config.development
        })
    )
})

// テストファイル rollup
gulp.task('rollup-test', ['rollup'], () => {
    return rollup.rollup({
        input: `${config.srcTestDir}/index.js`,
        plugins: [
            rollupAlias({
                vue: 'node_modules/vue/dist/vue.esm.js'
            }),
            rollupNodeResolve(),
            rollupReplace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
            rollupBabel({
                babelrc: false,
                comments: false
            }),
        ]
    }).then(bundle => {
        return bundle.write({
            file: `${config.rollupTestDest}/index.js`,
            format: 'iife',
            name: 'main',
            sourcemap: config.development
        })
    })
})

gulp.task('copy', ['rollup'], () => {
    return gulp.src(`${config.rollupDest}/vue-yar.js`)
               .pipe(gulp.dest(config.distribution))
})

gulp.task('copy-test', ['rollup', 'rollup-test'], () => {
    return gulp.src([
        `${config.srcTestDir}/*.html`,
        `${config.srcTestDir}/*.json`,
        `${config.rollupTestDest}/*.js`,
        `${config.rollupDest}/vue-yar.js`
    ]).pipe(gulp.dest(config.test))
})

// ビルド
gulp.task('assemble', ['compile-typescript', 'rollup', 'copy', 'copy-test'])
gulp.task('build', ['compile-typescript', 'rollup', 'rollup-test', 'copy', 'copy-test'])
gulp.task('default', ['build'])

gulp.doneCallback = (error) => {
    // テスト実行時、Karmaかnodeのバグで、コネクションが生きているのかプロセスが終了しない
    // タスク完了時のコールバックで、強制的にプロセスを終了する
    process.exit(error ? -1 : 0)
}
