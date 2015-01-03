module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            core: {
                options: {
                    banner: '/*! lining.min.js v<%= pkg.version %>(c) <%= grunt.template.today("yyyy-mm-dd") %> MZhou @license MIT */\n'
                },
                files: {
                    'build/lining.min.js': ['src/lining.js'],
                }
            },
            effect: {
                options: {
                    banner: '/*! lining.effect.min.js v<%= pkg.version %> (c) <%= grunt.template.today("yyyy-mm-dd") %> MZhou @license MIT */\n'
                },
                files: {
                    'build/lining.effect.min.js': ['src/lining.effect.js']
                }
            }
        },
        jshint: {
            options: {
                laxbreak: true,
                eqnull: true,
                sub: true,
                boss: true,
                browser: true
            },
            all: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js']
        },
        jasmine: {
            components: {
                src: [
                    'src/lining.js',
                    'src/lining.effect.js'
                ],
                options: {
                    specs: 'spec/*.js',
                    keepRunner : true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-jasmine');

    grunt.registerTask('default', ['jshint', 'uglify']);
    grunt.registerTask('travis', ['jshint', 'jasmine']);
};
