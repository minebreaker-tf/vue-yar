const gulp = require("gulp")
const rollup = require("rollup")
const rollupAlias = require("rollup-plugin-alias")
const rollupTypescript = require("rollup-plugin-typescript2")
const rollupReplace = require("rollup-plugin-replace")
const rimraf = require("rimraf")
const karma = require("karma")

const config = {
    // TypeScriptソース
    srcDir: "src",
    srcTestDir: "test",
    // ビルド出力先
    buildBase: "build",
    rollupDest: "build/rollup",
    rollupTestDest: "build/rollupTest",
    test: "build/test",
    sampleDest: "sample",
    distribution: "dist",
    development: true
}

// 出力先をクリンナップ
gulp.task("clean", () => {
    return new Promise(() => {
        rimraf.sync(`${config.buildBase}/*`)
        rimraf.sync(`${config.distribution}/*`)
    })
})

// rollup
gulp.task("rollup", () => {
    return rollup.rollup({
        input: `${config.srcDir}/vue-yar.ts`,
        external: [
            "vue"
        ],
        plugins: [
            rollupTypescript()
        ]
    }).then(bundle =>
        bundle.write({
            file: `${config.rollupDest}/vue-yar.js`,
            format: "es",
            sourcemap: config.development
        })
    )
})

// テストファイル rollup
gulp.task("rollup-sample", ["rollup"], () => {
    return rollup.rollup({
        input: `${config.srcTestDir}/sample.js`,
        plugins: [
            rollupTypescript(),
            rollupAlias({
                vue: "node_modules/vue/dist/vue.esm.js"
            }),
            rollupReplace({ "process.env.NODE_ENV": JSON.stringify("development") })
        ]
    }).then(bundle => {
        return bundle.write({
            file: `${config.rollupTestDest}/sample.js`,
            format: "iife",
            name: "main",
            sourcemap: config.development
        })
    })
})

gulp.task("rollup-test", () => {
    return rollup.rollup({
        input: `${config.srcTestDir}/test-all.ts`,
        plugins: [
            rollupTypescript(),
            rollupAlias({
                vue: "node_modules/vue/dist/vue.esm.js"
            }),
            rollupReplace({ "process.env.NODE_ENV": JSON.stringify("development") })
        ]
    }).then(bundle => {
        return bundle.write({
            file: `${config.rollupTestDest}/test-all.js`,
            format: "iife",
            name: "test",
            sourcemap: config.development
        })
    })
})

gulp.task("test", ["rollup-test"], callback => {
    new karma.Server({
        configFile: `${__dirname}/karma.conf.js`,
        singleRun: true
    }, result => {
        if (result === 0) {
            callback()
        } else {
            throw Error("Test failed: " + result)
        }
    }).start()
})

gulp.task("copy", ["rollup"], () => {
    return gulp.src(`${config.rollupDest}/vue-yar.js`)
               .pipe(gulp.dest(config.distribution))
})

gulp.task("copy-sample", ["rollup", "rollup-sample"], () => {
    return gulp.src([
        `${config.rollupTestDest}/sample.js`
    ]).pipe(gulp.dest(config.sampleDest))
})

// ビルド
gulp.task("assemble", ["rollup", "copy"])
gulp.task("build", ["rollup", "test", "copy", "copy-sample"])
gulp.task("default", ["build"])

gulp.doneCallback = (error) => {
    // テスト実行時、Karmaかnodeのバグで、コネクションが生きているのかプロセスが終了しない
    // タスク完了時のコールバックで、強制的にプロセスを終了する
    process.exit(error ? -1 : 0)
}
