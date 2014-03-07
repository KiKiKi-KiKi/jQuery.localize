module.exports = function(grunt) {
  var pkg = grunt.file.readJSON('package.json');

  grunt.initConfig({
    // jade
    jade: {
      compile: {
        expand: true,
        cwd: 'jade/',
        src: '*.jade',
        dest: '',
        ext: '.html',
        options: {
          // min化しない ... true
          pretty: true
        }
      }
    },
    // javascript
    jshint: {
      options: {
        globals: {
          jQuery: true,
          console: true,
          module: true
        },
        unused: true, // 宣言したきり使っていない変数を検出
        // グローバル変数へのアクセスの管理
        browser: true, // ブラウザ用のやつは許可
        devel: true,   // consoleやalertを許可
        expr: true     // x || (x = 1); とかができるようにする
      },
      files: 'dev/js/src/*.js'
    },
    uglify: {
      options: {
        banner: '/*!\n * jQuery.localize <%= grunt.template.today("dd-mm-yyyy") %>\n * https://github.com/chaika-design/jQuery.localize\n */\n'
      },
      compile: {
        files: {
          'assets/js/jquery.localize.min.js': 'assets/js/jquery.localize.js'
        }
      }
    },
    // json
    minjson: {
      compile: {
        files: {
          "lang/ja/lang.json": ['assets/lang/ja/*.json']
        }
      }
    },
    watch: {
      jade: {
        files: [
          'jade/*.jade',
        ],
        tasks: 'jade:compile',
        options: {
          nospawn: true
        }
      },
      // JS
      js: {
        // 監視ファイル
        files: ['assets/js/*.js'],
        // 実行タスク
        tasks: ['js'],
        options: {
          nospawn: true
        }
      },
      // json
      json: {
        files: ['assets/lang/**/*.json'],
        tasks: 'minjson:compile',
        options: {
          nospawn: true
        }
      }
    }
  });


  for(var taskName in pkg.devDependencies) {
    if(taskName.substring(0, 6) == 'grunt-') {
      grunt.loadNpmTasks(taskName);
    }
  }

  // JS のタスクをセット
  grunt.registerTask('js', ['jshint', 'uglify:compile']);

  grunt.registerTask('default', 'watch');
};
