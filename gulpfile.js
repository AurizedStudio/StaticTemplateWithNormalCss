var gulp = require('gulp');
var concat = require('gulp-concat');
var browserSync = require('browser-sync');
//var autoprefixer = require('gulp-autoprefixer');
var postcss      = require('gulp-postcss');
var sourcemaps   = require('gulp-sourcemaps');
var autoprefixer = require('autoprefixer-core');
// var plumber = require('gulp-plumber'); // エラーが起きてもwatchを終了しない
// var notify = require('gulp-notify'); // エラーが起こったときの通知
// var using = require('gulp-using'); // タスクが処理をしているファイル名を出力
// var cached = require('gulp-cached'); // 変更があったファイルにだけ処理を行う
// var remember = require('gulp-remember'); // キャッシュしたストリームを取り出す
var spritesmith = require('gulp.spritesmith'); // スプライトイメージ作成
var iconfont = require('gulp-iconfont'); // アイコンフォント作成
var consolidate = require('gulp-consolidate'); // アイコンフォント作成
// var runSequence = require('run-sequence'); // 順番に実行してほしいタスク名を指定

var path = {
//    srcScss: './source/scss/',
    srcCss: './source/css/',
    srcSprite: './source/sprite-img/',
    srcSvg: './source/svg/',
    dest: './htdocs/',
    destCss: './htdocs/css/',
    destJs: './htdocs/js/',
    destImg: './htdocs/img/',
    destFont: './htdocs/fonts/'
//    scripts: ['client/js/**/*.coffee', '!client/external/**/*.coffee'],
};

// エラー通知が必要なタスク使用。通知が必要ない場合には通常のplumberをとるようにする
// .pipe(plumberWithNotify()) or .pipe(plumber())
function plumberWithNotify() {
    return plumber({errorHandler: notify.onError("<%= error.message %>")});
}

// ローカルサーバーをたてる
gulp.task('server', function() {
    browserSync({
        server: {
            baseDir: path.dest,
            directory: true
        }
    });
});

// fontファイル、各種cssファイル、各種jsファイルをコピー
gulp.task('preCopy', function() {
    gulp.src('./bower_components/animate-css/animate.css')
    .pipe(gulp.dest(path.srcCss));
//    gulp.src('./bower_components/bootstrap-sass/assets/fonts/bootstrap/*')
//    .pipe(gulp.dest(path.dest + 'fonts/'));
    gulp.src('./bower_components/normalize-css/normalize.css')
    .pipe(gulp.dest(path.srcCss));
    gulp.src('./bower_components/OwlCarousel2/dist/assets/owl.carousel.css')
    .pipe(gulp.dest(path.srcCss));
    gulp.src('./bower_components/OwlCarousel2/dist/assets/owl.theme.default.css')
    .pipe(gulp.dest(path.srcCss));
    gulp.src('./bower_components/OwlCarousel2/dist/owl.carousel.min.js')
    .pipe(gulp.dest(path.destJs));
    gulp.src('./bower_components/superfish/dist/css/superfish.css')
    .pipe(gulp.dest(path.srcCss));
    gulp.src('./bower_components/superfish/dist/js/superfish.min.js')
    .pipe(gulp.dest(path.destJs));
    gulp.src('./bower_components/superfish/dist/js/hoverIntent.js')
    .pipe(gulp.dest(path.destJs));
});

// cssフィアル結合
gulp.task('preConcatCss', function() {
    gulp.src([
        path.srcCss + 'normalize.css',
        path.srcCss + 'basic.css'
//        path.srcCss + 'animate.css',
//        path.srcCss + 'owl.carousel.css',
//        path.srcCss + 'owl.theme.default.css',
//        path.srcCss + 'superfish.css'
    ])
    .pipe(concat('style.css'))
    .pipe(gulp.dest(path.srcCss));
});

// post css 通常は source/css/style.css で作業
gulp.task('postCss', function(){
    return gulp.src(path.srcCss + 'style.css')
    .pipe(postcss([ autoprefixer({ browsers: ['last 2 version'] }) ]))
    .pipe(gulp.dest(path.destCss));
});

// 監視
gulp.task('watch', ['server'], function() {
    gulp.watch(
        [path.srcCss + 'style.css', path.dest + '*.html', path.destJs + '*.js'],
        ['postCss', browserSync.reload]
    );
});

// スプライトイメージ作成
gulp.task('sprite', function () {
  // Generate our spritesheet
  var spriteData = gulp.src(path.srcSprite + '*.png').pipe(spritesmith({
    imgName: 'sprite.png',
    cssName: 'img-sprite.css',
//    algorithm: 'binary-tree',
    imgPath: '../img/sprite.png'
  }));
  // Pipe image stream through image optimizer and onto disk
  spriteData.img
    .pipe(gulp.dest(path.destImg));
  // Pipe CSS stream through CSS optimizer and onto disk
  spriteData.css
    .pipe(gulp.dest(path.srcCss));
});

// スプライトcssファイルをstyle.cssに結合
gulp.task('postSprite', function() {
    gulp.src([
        path.srcCss + 'style.css',
        path.srcCss + 'img-sprite.css'
    ])
    .pipe(concat('style.css'))
    .pipe(gulp.dest(path.srcCss));
});

// アイコンフォント作成
var fontName = 'iconfont';
gulp.task('iconfont', function(){
    gulp.src([path.srcSvg + '*.svg'])
    .pipe(iconfont({
        fontName: fontName,
        normalize: true
    }))
    .on('codepoints', function(codepoints, options) {
        gulp.src(path.srcCss + 'iconfont/iconfont.css')
        .pipe(consolidate('underscore', {
            glyphs: codepoints,
            fontName: fontName,
            fontPath: '../fonts/',
            className: 'iconfont'
        }))
        .pipe(gulp.dest(path.srcCss));
    })
    .pipe(gulp.dest(path.destFont));
});

// アイコンフォントcssファイルをstyle.cssに結合
gulp.task('postIconfont', function() {
    gulp.src([
        path.srcCss + 'style.css',
        path.srcCss + 'iconfont.css'
    ])
    .pipe(concat('style.css'))
    .pipe(gulp.dest(path.srcCss));
});

// デフォルト ローカルサーバーを起ち上げ、ファイルを監視しつつ、ブラウザオートリロード
gulp.task('default', ['watch']);
