var path         = require('path');
    gulp    	 = require('gulp'),
    gutils       = require('gulp-util'),
    gulpif       = require('gulp-if'),
	concat		 = require('gulp-concat'),
	uglify		 = require('gulp-uglify'),
    jshint       = require('gulp-jshint'),
	sass 		 = require('gulp-sass'),
	minifyCss	 = require('gulp-minify-css'),
	autoprefixer = require('gulp-autoprefixer'),
	sourcemaps	 = require('gulp-sourcemaps'),
	rename	 	 = require('gulp-rename'),
	notify		 = require('gulp-notify'),
	merge 		 = require('merge-stream'),
    browserSync  = require('browser-sync').create(),
    swig         = require('gulp-swig'),
    data         = require('gulp-data'),
    runSequence  = require('run-sequence'),
    config       = require('./config');

// utilities
var UTILITIES = {};

// is undefined;
UTILITIES.ISUNDEFINED = function(obj, undefined){
    return obj === undefined;
};

// production
var PRODUCTION = UTILITIES.ISUNDEFINED(config.production) ? ( UTILITIES.ISUNDEFINED(gutils.env.production) ? false : gutils.env.production ) : config.production;

// has browser-sync
var HASBROWSERSYNC = false;

// notifications
var NOTIFICATIONS = function(message){
    this.title = config.title

    if(!UTILITIES.ISUNDEFINED(message))  return this.message(message);
};

NOTIFICATIONS.prototype = {

    message : function(message){

        return notify({
            title: this.title,
            message: message,            
            onLast: true
        });

    },

    error : function(error, message){

        notify.onError({
            title: this.title,
            message: message + ':' + error.message,
            onLast: true
        })(error);

        console.log(error);

    }

};

// Tasks

var TASKS = function(){

    var that = this,

    tasks = config.tasks || {},

    default_tasks = [],

    watches = {};

    for(var task in tasks){

        // set HASBROWSERSYNC to true if tasks has browsersync
        if( task === 'browsersync') HASBROWSERSYNC = true;

        if (!UTILITIES.ISUNDEFINED(that[task])) {

            (function(task,tasks){
           
                gulp.task(task, function () {
                    var streams = [],

                    options = tasks.options || {},

                    clone_tasks = JSON.parse(JSON.stringify(tasks));

                    if(!UTILITIES.ISUNDEFINED(clone_tasks.files)){
                        for(var i = 0; i < clone_tasks.files.length; i++){

                            for(var j = 0; j < clone_tasks.files[i].src.length; j++){
                                clone_tasks.files[i].src[j] = config.path.src + clone_tasks.files[i].src[j];
                            }

                            clone_tasks.files[i].dist = config.path.dist + clone_tasks.files[i].dist; 

                            streams.push(that[task](clone_tasks.files[i],options));
                        }

                        return merge(streams);
                    }

                    that[task](clone_tasks.options);
                });

                if(!UTILITIES.ISUNDEFINED(tasks.watch))
                    watches[task] = tasks.watch;

                default_tasks.push(task);

            })(task,tasks[task]);

        }

    }

    gulp.task('default',function(){

        for(var watch in watches){
            (function(watch){
                var reload = watches[watch].reload || false;

                if(reload && HASBROWSERSYNC)
                    gulp.watch(config.path.src + watches[watch].files,[watch]).on('change',browserSync.reload);
                else
                    gulp.watch(config.path.src + watches[watch].files,[watch]);

            })(watch);

        }

        runSequence(default_tasks);
    });

};

// task js
TASKS.prototype.sass = function(files, options){

    var filename = path.basename(files.dist),

    autoprefix = {
        enabled : UTILITIES.ISUNDEFINED(files.autoprefix.enabled) ? false : files.autoprefix.enabled,
        browsers : UTILITIES.ISUNDEFINED(files.autoprefix.browsers) ? [] : files.autoprefix.browsers,
    };

    return gulp.src(files.src)
        .pipe(gulpif(!PRODUCTION,sourcemaps.init()))
        .pipe(sass(options))
        .on('error', function(error){

            new NOTIFICATIONS().error(error, 'SASS Compilation Failed');

            this.emit('end');

        })
        .pipe(gulpif(autoprefix.enabled,autoprefixer(autoprefix.browsers)))
        .pipe(concat(filename))
        .pipe(gulpif(PRODUCTION,minifyCss()))
        .pipe(gulpif(PRODUCTION,rename({ suffix: '.min' })))
        .pipe(gulpif(!PRODUCTION,sourcemaps.write('./')))
        .pipe(gulp.dest(files.dist.replace(filename,'')))
        .pipe(new NOTIFICATIONS('SASS Compiled!'))
        .pipe(gulpif(HASBROWSERSYNC,browserSync.stream()));

};

// task js
TASKS.prototype.js = function(files,options){

    var filename = path.basename(files.dist);

    return gulp.src(files.src)
        .pipe(gulpif(!PRODUCTION,sourcemaps.init()))
        .pipe(concat(filename))                
        .on('error', function(error){

            new NOTIFICATIONS().error(error, 'JS Compilation Failed');

            this.emit('end');

        })
        .pipe(gulpif(PRODUCTION,uglify()))
        .pipe(gulpif(PRODUCTION,rename({ suffix: '.min' })))
        .pipe(gulpif(!PRODUCTION,sourcemaps.write('./')))
        .pipe(gulp.dest(files.dist.replace(filename,'')))
        .pipe(new NOTIFICATIONS('JS Compiled!'))
        .pipe(gulpif(HASBROWSERSYNC,browserSync.stream()));

};

// task copy
TASKS.prototype.copy = function(files,options){

    return gulp.src(files.src)             
        .on('error', function(error){

            new NOTIFICATIONS().error(error, 'Files Copy Failed');

            this.emit('end');

        })
        .pipe(gulp.dest(files.dist))
        .pipe(new NOTIFICATIONS('Files Copied!'))
        .pipe(gulpif(HASBROWSERSYNC,browserSync.stream()));

};

// task browsersync 
TASKS.prototype.browsersync = function(options){

    browserSync.init(options);

};

// task swig 
TASKS.prototype.swig = function(files,options){

    options.data = {
        PRODUCTION : PRODUCTION
    };

    return gulp.src(files.src)
        .pipe(swig(options))
        .on('error', function(error){

            new NOTIFICATIONS().error(error, 'Swig Compilation Failed');

            this.emit('end');

        })
        .pipe(gulp.dest(files.dist))
        .pipe(new NOTIFICATIONS('Swig Compiled!'))
        .pipe(gulpif(HASBROWSERSYNC,browserSync.stream()));

};

// initialize
new TASKS();