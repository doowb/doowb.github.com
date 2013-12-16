// Blog, by @doowb

module.exports = function(grunt) {

  'use strict';

  var data = grunt.file.readJSON;

  // Project configuration.
  grunt.initConfig({
    pkg:       data('package.json'),
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
        ext: '.html'
      },
      component: {
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
        tasks: ['default']
      }
    }
  });

  grunt.config.set('bootstrap.base', './src/assets/bootstrap');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('assemble');
  grunt.loadNpmTasks('assemble-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task.
  grunt.registerTask('default', ['assemble']);

};

