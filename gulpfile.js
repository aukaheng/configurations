const { src, dest, watch, parallel, series } = require('gulp');

const exec = require('child_process').exec;
const fs = require('fs');

const tap = require('gulp-tap');

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

function buildStyles(cb)
{
  return src('scss/*.scss', { read: false })
    .pipe(tap(function () {
      const cmd = `yarn run parcel build "${file.path}" --public-url . --no-cache --no-source-maps --no-content-hash`;

      exec(cmd, {
        env: {
          ...process.env,
          FORCE_COLOR: 1
        }
      }, function (error, stdout, stderr) {
        if (error == null) {
          console.log(stdout);
        } else {
          console.log(stderr);
        }

        cb(error);
      });
    }));
}

function buildScripts(cb)
{
  return src('ts/*.ts', { read: false })
    .pipe(tap(function () {
      const cmd = `yarn run parcel build "${file.path}" --public-url . --no-cache --no-source-maps`;

      exec(cmd, {
        env: {
          ...process.env,
          FORCE_COLOR: 1
        }
      }, function (error, stdout, stderr) {
        if (error == null) {
          console.log(stdout);
        } else {
          console.log(stderr);
        }

        cb(error);
      });
    }));
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

        exec(
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

            cb(error);
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
