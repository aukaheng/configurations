const { src, dest, parallel, series, watch } = require('gulp');
const tap = require('gulp-tap');
const robocopy = require('robocopy');

const exec = require('child_process').execSync;
const fs = require('fs');

function copyWebFonts(cb)
{
  robocopy({
    source: 'node_modules/bootstrap-icons/font/fonts',
    destination: 'dist/fonts',
    files: [
      '*.*'
    ]
  });

  cb();
}

function copyNPMFiles(cb)
{
  src([
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map',
    'node_modules/bootstrap/dist/css/bootstrap.min.css',
    'node_modules/bootstrap/dist/css/bootstrap.min.css.map',
    'node_modules/bootstrap-icons/font/bootstrap-icons.min.css',
    'node_modules/vue/dist/vue.global.js',
    'node_modules/vue/dist/vue.global.prod.js'
  ])
    .pipe(dest('dist'));

  cb();
}

function buildStyles(cb)
{
  return src('scss/*.scss', { read: false })
    .pipe(tap(function (file) {
      console.log('');
      console.log('🟧 ' + file.basename);

      try {
        exec(
          `pnpm exec parcel build "${file.path}" --public-url . --no-cache --no-source-maps --no-content-hash`,
          {
            env: {
              ...process.env,
              FORCE_COLOR: 1
            },
            stdio: 'inherit'
          }
        );

        console.log('😆');
      } catch (e) {
        console.log('🤮');
      }
    }));
}

function buildScripts(cb)
{
  return src('ts/*.ts', { read: false })
    .pipe(tap(function (file) {
      console.log('');
      console.log('🟦 ' + file.basename);

      try {
        exec(
          `pnpm exec parcel build "${file.path}" --public-url . --no-cache --no-source-maps`,
          {
            env: {
              ...process.env,
              FORCE_COLOR: 1
            },
            stdio: 'inherit'
          }
        );

        console.log('😆');
      } catch (e) {
        console.log('🤮');
      }
    }));
}

function watching(cb)
{
  const watcher = watch([
    'scss/*.scss',
    'ts/*.ts',
    'ts/**/*.vue'
  ]);

  watcher.on('change', function (path, stats) {
    console.log('📦 ' + path + '...');

    const regex = new RegExp('.vue$');

    // ts\a.ts
    // ts\components\a.vue
    if (regex.test(path)) {
      path = path.replace(/\\components\\/, '\\');
      path = path.replace(regex, '.ts');
      console.log('📦 ' + path + '...');
    }
    else if (/.d.ts$/.test(path)) {
      console.log("\nThis is a definition file 😛\n");
      return;
    }

    fs.access(path, (err) => {
      if (err) {
        console.log('🤢 File not found');
        console.log('');
      } else {
        const cmd = 'pnpm exec parcel build "' + path + '" --public-url . --no-cache --no-source-maps --no-content-hash --no-optimize';

        console.log('+-----------------------------------------------+');
        console.log('|                                               |');

        try {
          exec(
            cmd,
            {
              env: {
                ...process.env,
                FORCE_COLOR: 1
              },
              stdio: 'inherit'
            }
          );
        } catch (e) {
          console.log('🤮🤮🤮🤮🤮🤮');
        }

        console.log('|                                               |');
        console.log('+-----------------------------------------------+');
        console.log('');
      }
    });
  });
}

exports.publish = parallel(
  copyWebFonts,
  copyNPMFiles,
  buildStyles,
  buildScripts
);

exports.watch = watching;

exports.default = buildStyles;
