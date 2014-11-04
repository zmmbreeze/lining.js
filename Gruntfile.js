module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.name %> v<%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files: {
                    'build/lining.min.js': ['src/lining.js'],
                    'build/lining.effect.min.js': ['src/lining.effect.js'],
                    'build/lining.all.min.js': ['src/lining.js', 'src/lining.effect.js']
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
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');

    grunt.registerTask('default', ['jshint', 'uglify']);
};
