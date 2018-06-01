module.exports = function(grunt) {
	'use strict';
	grunt.initConfig({
		jshint: {
			options: {
				jshintrc: 'js/.jshintrc'
			},
			src: ['Gruntfile.js', 'app/module/**/*.js']
		},
		nggettext_compile: {
            iphone: {
              files: {
                './app/language/iphone.js': ['./app/language/extract/iphone.po']
              }
            },
          },
		nggettext_extract: {
            iphone: {
              files: {
                './app/language/extract/iphone.pot': [
                    './app/templates/iphone/*/*/*.html',
                    './app/templates/iphone/*/*.html',
                    './app/templates/iphone/*.html',
                    './app/module/*/*/*.js',
                    './app/module/*/*.js',
                    './app/global/*/*/*.js',
                    './app/global/*/*.js',
                    './app/global/*.js'
                    ]
              }
            },
          },
		requirejs: {
			iphone: {
				options: {
					baseUrl: "./",
                    name: "app",
                    out: "./dist.iphone/js/main.js",
					paths: {
						app: "./app/settings/iphone",
					},
					optimize: "none",
					mainConfigFile: "./app/settings/iphone.js",
				}
			},
			ipad: {
				options: {
					baseUrl: "./",
                    name: "app",
                    out: "./dist.ipad/js/main.js",
					paths: {
						app: "./app/settings/ipad",
					},
					optimize: "none",
					mainConfigFile: "./app/settings/ipad.js",
				}
			},
			android: {
				options: {
					baseUrl: "./",
                    name: "app",
                    out: "./dist.android/js/main.js",
					paths: {
						app: "./app/settings/android",
					},
					optimize: "none",
					mainConfigFile: "./app/settings/android.js",
				}
			},
        },
        sass: {
            iphone: {
                options: {
                    style: 'expanded',
                },
                files: {
                    "./dist.iphone/css/main.css": "./app/themes/iphone/ionic.scss",
                },
            },
            ipad: {
                options: {
                    style: 'expanded',
                },
                files: {
                    "./dist.ipad/css/main.css": "./app/themes/ipad/ionic.scss",
                }
            },
            android: {
                options: {
                    style: 'expanded',
                },
                files: {
                    "./dist.android/css/main.css": "./app/themes/android/ionic.scss",
                }
            },
			zipcss: {
                options: {
                    style: 'expanded',
                },
                files: {
                    "./css/main.css": "./app/themes/iphone/ionic.scss",
                },
            }
        },
        copy: {
            iphone: {
                files: [
                    {expand: true, cwd: 'app/settings/', src: ['site.js'], dest: 'dist.iphone/js/'},
                    {expand: true, cwd: 'dist.iphone/', src: ['**'], dest: '../platforms/ios/www/'}
                ]
            },
            ipad: {
                files: [
                    {expand: true, cwd: 'app/settings/', src: ['site.js'], dest: 'dist.ipad/js/'},
                    {expand: true, cwd: 'dist.ipad/', src: ['**'], dest: '../platforms/ipad/www/'}
                ]
            },
            android: {
                files: [
                    {expand: true, cwd: 'app/settings/', src: ['site.js'], dest: 'dist.android/js/'},
                    {expand: true, cwd: 'dist.android/', src: ['**'], dest: '../platforms/android/assets/www/'}
                ]
            }
        }
    });

    // grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-requirejs');
    grunt.loadNpmTasks('grunt-angular-gettext');
    grunt.loadNpmTasks('grunt-contrib-copy');

    // grunt.registerTask('build', ['jshint', 'requirejs']);
    grunt.registerTask('build', ['requirejs', 'sass', 'copy']);
    grunt.registerTask('iphone', ['requirejs:iphone','sass:iphone', 'copy:iphone']);
    grunt.registerTask('ipad', ['requirejs:ipad', 'sass:ipad', 'copy:ipad']);
    grunt.registerTask('android', ['requirejs:android', 'sass:android', 'copy:android']);
    grunt.registerTask('zipcss', ['sass:zipcss']);
    // grunt.registerTask('default', ['jshint']);
};
