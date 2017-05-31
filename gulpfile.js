const fs = require('fs');
const path = require('path');

const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');
const runSequence = require('run-sequence');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const validate = require('webpack-validator').validateRoot;

const browserSync = require('browser-sync').create();
const webpackDevMiddleware = require('webpack-dev-middleware');
const proxy = require('http-proxy-middleware');
const stripAnsi = require('strip-ansi');

const devWebpackConfig = require('./webpack.config');
const productionWebpackConfig = require('./webpack.production.config');

const proxyConfig = require('./proxy.config');

const config = require('./config');
const MODULE_NAME = config.MODULE_NAME;
const SOURCE_DIST = config.SOURCE_DIST;
const BUILD_DIST = config.BUILD_DIST;
const RELEASE_DIST = config.RELEASE_DIST;

function getFolders(dir) {
  const folders = fs.readdirSync(dir)
    .filter(function (file) {
      return fs.statSync(path.join(dir, file)).isDirectory();
    });
  const index = folders.indexOf('common');
  folders.splice(index, 1);
  return folders;
}


function getConfig(type) {
  const folders = getFolders(SOURCE_DIST);
  const webpackConfig = (type === 'production' ? productionWebpackConfig : devWebpackConfig);
  const config = {
    entry: {}
  };
  Object.assign(config, webpackConfig);

  for (const folder of folders) {
    config.entry[folder] = `${SOURCE_DIST}/${folder}/app`;
    config.plugins.push(new HtmlWebpackPlugin({
      chunks: ['commons', folder],
      filename: `${MODULE_NAME}/${folder}/index.html`,
      template: `${SOURCE_DIST}/${folder}/index.html`
    }));
  }

  return config;
}

gulp.task('clean', function () {
  return del([BUILD_DIST, RELEASE_DIST]);
});

gulp.task('archive', function () {
  return gulp.src(`${BUILD_DIST}/**/*`)
    .pipe($.zip('archive.zip'))
    .pipe(gulp.dest(RELEASE_DIST));
});

// 本地调试用的编译
gulp.task('build', function (cb) {
  const config = getConfig('dev');

  // 校验配置信息
  validate(config);

  webpack(config, function (err, stats) {
    if (err) throw new $.util.PluginError("webpack", err);
    $.util.log("[webpack]", stats.toString({
      colors: true
    }));
    cb();
  });
});

// 用于生产环境编译
gulp.task('build:release', ['clean', 'lint'], function (cb) {
  const config = getConfig('production');

  // 校验配置信息
  validate(config);

  webpack(config, function (err, stats) {
    if (err) throw new $.util.PluginError("webpack", err);
    $.util.log("[webpack]", stats.toString({
      colors: true
    }));
    cb();
  });
});

// 用于jekins自动部署的研发用环境编译
gulp.task('build:dev', ['clean', 'lint'], function (cb) {
  const config = getConfig('production');
  config.output.publicPath = '/mail/app/';
  config.resolve.alias.domainConfig = path.join(__dirname, "./domain.config.dev.js");
  // 校验配置信息
  validate(config);

  webpack(config, function (err, stats) {
    if (err) throw new $.util.PluginError("webpack", err);
    $.util.log("[webpack]", stats.toString({
      colors: true
    }));
    cb();
  });
});

// 用于QA测试用的环境编译
gulp.task('build:test', ['clean', 'lint'], function (cb) {
  const config = getConfig('production');
  config.output.publicPath = '/mail/app/';
  config.resolve.alias.domainConfig = path.join(__dirname, "./domain.config.test.js");
  // 校验配置信息
  validate(config);

  webpack(config, function (err, stats) {
    if (err) throw new $.util.PluginError("webpack", err);
    $.util.log("[webpack]", stats.toString({
      colors: true
    }));
    cb();
  });
});

gulp.task('release', function (cb) {
  runSequence('build:release', 'archive', cb);
});

gulp.task('release:dev', function (cb) {
  runSequence('build:dev', 'archive', cb);
});

gulp.task('release:test', function (cb) {
  runSequence('build:test', 'archive', cb);
});

gulp.task('default', ['build']);

gulp.task('server', function () {
  const config = getConfig('dev');
  // 校验配置信息
  validate(config);
  const bundler = webpack(config);

  bundler.plugin('done', function (stats) {
    if (stats.hasErrors() || stats.hasWarnings()) {
      return browserSync.sockets.emit('fullscreen:message', {
        title: "Webpack Error:",
        body: stripAnsi(stats.toString()),
        timeout: 100000
      });
    }
    browserSync.reload();
  });

  const apiProxy = proxy(proxyConfig.urlPattern, {
    target: proxyConfig.target,
    changeOrigin: true,
    logLevel: proxyConfig.logLevel
  });

  browserSync.init({
    server: BUILD_DIST,
    open: true,
    logFileChanges: false,
    middleware: [
      webpackDevMiddleware(bundler, {
        stats: {colors: true}
      }),
      apiProxy
    ],
    plugins: ['bs-fullscreen-message']
  });
});

gulp.task('lint:js', function () {
  return gulp.src('app/**/*.js')
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.eslint.failAfterError());
});

gulp.task('lint:css', ['lint:js'], function () {
  return gulp.src('app/**/*.css')
    .pipe($.stylelint({
      reporters: [
        {formatter: 'string', console: true}
      ]
    }));
});

gulp.task('lint', ['lint:css'], function (done) {
  $.util.log($.util.colors.green("Congratulations! There is no problems in your code."));
  done();
});
