module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                src: 'src/lining.js',
                dest: 'build/lining.min.js'
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
