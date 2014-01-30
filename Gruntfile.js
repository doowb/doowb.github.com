// Blog, by @doowb

module.exports = function (grunt) {

  'use strict';

  var data = grunt.file.readJSON;

  // Project configuration.
  grunt.initConfig({
    pkg: data('package.json'),
    bootstrap: data('src/bootstrap.json'),

    less: {
      options: {
        require: '<%= bootstrap.less.globals %>',
        paths: '<%= bootstrap.base %>'
      },
      component: {
        files: {
          'public/css/styles.css': ['src/styles/styles.less']
        }
      }
    },
    assemble: {
      options: {
        flatten: true,
        layout: 'src/layouts/default.hbs',
        partials: ['src/partials/*.hbs'],
        data: ['src/data/**/*.{json,yml}'],
        assets: 'public',
        ext: '.html',
        log: {
          level: 'debug',
          theme: 'socket.io'
        }
      },
      component: {
        options: {
          plugins: ['src/plugins/plugin-*.js']
        },
        files: [
          {
            dest: './',
            src: ['src/pages/*.hbs']
          }
        ]
      }
    },

    watch: {
      blog: {
        files: 'src/**/*.*',
        tasks: ['default'],
        options: {
          spawn: false
        }
      }
    },

    hapi: {
      local: {
        options: {
          server: require('path').resolve('./server'),
          bases: {
            '/': require('path').resolve('./'),
            '/css': require('path').resolve('./public/css'),
            '/js': require('path').resolve('./public/js')
          }
        }
      }
    }

  });

  grunt.config.set('bootstrap.base', './src/assets/bootstrap');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-assemble');
  grunt.loadNpmTasks('assemble-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-hapi');

  // Default task.
  grunt.registerTask('default', ['assemble', 'hapi']);

  grunt.registerTask('dev', ['default', 'watch']);

};