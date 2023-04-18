const { src, dest, watch, parallel, series } = require('gulp');
const exec = require('gulp-exec');

const childProcessExecute = require('child_process').exec;
const fs = require('fs');

function copyNPMFiles() {
  return src([
    'node_modules/x/y/z.min.js',
    'node_modules/a/b/c.min.js'
  ])
    .pipe(dest('dist'));
}
function copyWebFonts() {
  return src(['node_modules/x/y/z/fonts/*.*'])
    .pipe(dest('dist/fonts'));
}

function buildProduction() {
  return src(['ts/*.ts', 'scss/*.scss'], {
    read: false
  })
    .pipe(
      exec(
        (file) =>
          `parcel build "${file.path}" --public-url . --no-cache --no-source-maps`
      )
    )
    .pipe(exec.reporter());
}

function watching(cb) {
  const watcher = watch(['ts/*.ts', 'ts/components/*.vue', 'scss/*.scss']);

  watcher.on('change', function (path, stats) {
    console.log('');
    console.log('📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦');
    console.log('Start building ' + path + '...');

    const regex = new RegExp('.vue$');

    // ts\registration.ts <--> ts\components\registration.vue
    if (regex.test(path)) {
      path = path.replace(/\\components\\/, '\\');
      path = path.replace(regex, '.ts');
      console.log('Building from its related TypeScript: ' + path + '...');
    }

    fs.access(path, (err) => {
      if (err) {
        console.log('🤢🤢🤢🤢🤢🤢 File not found!');
        console.log('');
      } else {
        const cmd =
          'yarn run parcel build "' +
          path +
          '" --public-url . --no-cache --no-source-maps --no-optimize';

        childProcessExecute(
          cmd,
          {
            env: {
              ...process.env,
              FORCE_COLOR: 1
            }
          },
          function (error, stdout, stderr) {
            console.log('------------------------------------------------------------------------------');
            console.log(stdout);
            console.log("------------------------------------------------------------------------------\n");

            if (stderr != null && stderr != '') {
              console.log(stderr);
              console.log('🤮🤮🤮🤮🤮🤮 Error!');
            } else {
              console.log('🤩🤩🤩🤩🤩🤩 Done!');
            }
          }
        );
      }
    });
  });
}

exports.build = parallel(copyNPMFiles, copyWebFonts, buildProduction);
exports.watch = watching;
exports.default = series(copyWebFonts, copyNPMFiles);
