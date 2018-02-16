var gulp = require('gulp'), // подключаем gulp
    sass = require('gulp-sass'), //подключаем sass
    browserSync = require('browser-sync'), // подключаем browser sync
    concat = require('gulp-concat'), // подключаем gulp-concat (для конкатенации файлов)
    uglify = require('gulp-uglifyjs'), // подключаем gulp-uglify (для сжатия js)
    cssnano = require('gulp-cssnano'), // подключаем пакет для минификации css
    rename = require('gulp-rename'), // подключаем библиотеку для переименования файлов
    del = require('del'), // подключаем библиотеку для удаления файлов и папок
    imagemin = require('gulp-imagemin'), // подключаем библиотеку для работы с изображениями
    pngquant = require('imagemin-pngquant'), // подключаем библиотеку для работы с png
    cache = require('gulp-cache'), // подключаем библиотеку кеширования
    autoprefixer = require('gulp-autoprefixer'), // подключаем библиотеку для автоматического добавления префиксов
    plumber = require('gulp-plumber'), // вывод ошибок sass
    jade = require('gulp-jade'), // подключаем шаблонизатор pug
    babel = require('gulp-babel'); // babel

// таск "sass"
gulp.task('sass', function() {
    return gulp.src('app/sass/main.scss') //берем источник
        .pipe(plumber()) //не выбрасывать из компилятора если есть ошибки
        .pipe(sass({errLogToConsole: true})) //преобразуем sass в css посреlством gulp-sass
        .pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], {cascade: true})) // создаем префиксы
        .pipe(gulp.dest('app/css')) // выгружаем результат в папку app/css
        .pipe(browserSync.reload({stream: true})); //обновляем css на странице при изменении
});
// таск "babel"
gulp.task('babel', function() {
    gulp.src('app/js/main.js')
        .pipe(babel({
            presets: ['env']
        }))
        .pipe(gulp.dest('app/js/babel'));
});

// таск "jade"
gulp.task('jade', function () {
    return gulp.src('app/jade/index.jade') // берем файлы pug
        .pipe(jade({pretty:true})) //  конвертируем в html
        .pipe(gulp.dest('app')) // помещаем в эту папку
        .pipe(browserSync.reload({stream: true})); //обновляем css на странице при изменении
});

//таск "browser-sync"
gulp.task('browser-sync', function() {
    browserSync({ //выполняем browser sync
        server: { // определяем параметры сервера
            baseDir: 'app' // директория для сервера - app
        },
        notify: false // отключаем уведомления
    });
});

// таск конкатенации и сжатия файлов библиотек
// gulp.task('scripts', function() {
//     return gulp.src([ // берем все необходимые библиотеки
//         'app/libs/jquery/dist/jquery.min.js', // берем jQuery
//         'app/libs/magnific-popup/dist/jquery.magnific-popup.min.js' // берем magnific-popup
//     ])
//         .pipe(concat('libs.min.js')) // собираем их в кучу в новом файле Libs.min.js
//         .pipe(uglify()) // сжимаем js файл
//         .pipe(gulp.dest('app/js')); // выгружаем в папку app/js
// });

// таск минимизации, сжатия и переименования файла
gulp.task('css-libs', ['sass'], function(){
    return gulp.src('app/css/libs.css') // выбираем файл для минификации
        .pipe(cssnano()) // сжимаем
        .pipe(rename({suffix: '.min'})) // добавляем суффикс .min
        .pipe(gulp.dest('app/css')); // выгружаем в папку app/css
});

// таск наблюдения за изменениями файлов
gulp.task('watch', ['browser-sync', 'css-libs'], function() { //создаем таск "watch"
    gulp.watch('app/jade/index.jade', ['jade']);
    gulp.watch('app/sass/*.scss', ['sass']); //наблюдение за sass файлами
    gulp.watch('app/*.html', browserSync.reload); // наблюдение за html файлами
    gulp.watch('app/js/main.js', ['babel']); // наблюдение за js файлами
});

// таск очистки папки
gulp.task('clean', function() {
    return del.sync('dist'); // удаляем папку dist перед сборкой
});

// таск обработки изображений
gulp.task('img', function() {
    return gulp/src('app/img/**/*') // берем все изображения из app
            .pipe(cache.imagemin({ // сжимаем их с наилучшими настройками с учетом кеширования
                interlaced: true,
                progressive: true,
                cvgoPlugins: [{removeViewBox: false}],
                use: [pngquant()]
            }))
            .pipe(gulp.dest('dist/img')); // выгружаем на продакшн
});

// таск сборки в папку dist (продакшн)
gulp.task('build', ['clean',  'sass'], function() {

    var buildCss = gulp.src([ // преносим css стили в продакшн
        'app/css/main.css',
        'app/css/libs.min.css'
    ])
        .pipe(gulp.dest('dist/css'));

    var buildFonts = gulp.src('app/fonts/**/*') // переносим шрифты в продакшн
        .pipe(gulp.dest('dist/fonts'));

    var buildJs = gulp.src('app/js/**/*') //  переносим скрипты в продакшн
        .pipe(gulp.dest('dist/js'));

    var buildHtml = gulp.src('app/*.html') // переносим html  в продакшн
        .pipe(gulp.dest('dist'));
});

// таск для очистки кеша
gulp.task('clear', function() {
    return cache.clearAll();
});

// дефолтный таск
gulp.task('default', ['watch']);
