const { src, dest, watch, parallel, series } = require('gulp');
const exec = require('gulp-exec');

const childProcessExecute = require('child_process').exec;
const fs = require('fs');

function copyNPMFiles() {
  return src([
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map',
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'node_modules/bootstrap/dist/css/bootstrap.min.css.map',
    'node_modules/bootstrap-icons/font/bootstrap-icons.css'
  ])
    .pipe(dest('dist'));
}

function copyWebFonts() {
  return src([
    'node_modules/bootstrap-icons/font/fonts/*.*'
  ])
    .pipe(dest('dist/fonts'));
}

function buildStyles()
{
  return src('scss/*.scss', { read: false })
    .pipe(exec(file => `parcel build "${file.path}" --public-url . --no-cache --no-source-maps --no-content-hash`))
    .pipe(exec.reporter());
}

function buildScripts()
{
  return src('ts/*.ts', { read: false })
    .pipe(exec(file => `parcel build "${file.path}" --public-url . --no-cache --no-source-maps`))
    .pipe(exec.reporter());
}

function watching(cb) {
  const watcher = watch([
    'ts/*.ts',
    'ts/components/*.vue',
    'scss/*.scss'
  ]);

  watcher.on('change', function (path, stats) {
    console.log('');
    console.log('📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦📦');
    console.log('Start building ' + path + '...');

    // const regex = new RegExp('.vue$');

    // ts\registration.ts <--> ts\components\registration.vue
    if (/.vue$/.test(path)) {
      path = path.replace(/\\components\\/, '\\');
      path = path.replace(regex, '.ts');
      console.log("\nBuilding from its corresponding TypeScript file: " + path + '...');
    } else if (/.d.ts$/.test(path)) {
      console.log("\nThis is a definition file 😛\n");
      return;
    }

    fs.access(path, (err) => {
      if (err) {
        console.log('🤢🤢🤢🤢🤢🤢 File not found!');
        console.log('');
      } else {
        const cmd =
          'yarn run parcel build "' +
          path +
          '" --public-url . --no-cache --no-source-maps --no-optimize --no-content-hash';

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

exports.publish = parallel(
  copyNPMFiles,
  copyWebFonts,
  buildScripts,
  buildStyles
);
exports.watch = watching;
exports.default = series(copyWebFonts, copyNPMFiles);
