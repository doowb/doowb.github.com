// Blog, by @doowb

'use strict';

module.exports = function(grunt) {
  
  // Project configuration.
  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    pkg: grunt.file.readJSON('src/bootstrap.json'),

    less: {
      styles: {
        options: {
          require: '<%= bootstrap.less.globals %>',
          paths:  ['<%= bootstrap.base %>']
        },
        files: {
          'assets/css/styles.css': ['src/less/styles.less']
        }
      }
    },
    assemble: {
      pages: {
        options: {
          layout: 'src/layout.hbs'
          data:  ['src/data/*.json']
          assets: 'assets',
        },
        files: {
          '.': ['src/pages/*.hbs']
        }
      }
    },
    watch: {
      blog: {
        files: 'src/**/*.*',
        tasks: ['default']
      }
    }
  });

  grunt.config.set('bootstrap.base', './src/bootstrap');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('assemble-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['less', 'assemble']);

};
