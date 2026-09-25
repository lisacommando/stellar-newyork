module.exports = function (grunt) {
  grunt.initConfig({
    less: {
      compile: {
        files: {
          "assets/css/style.css": "assets/css/style.less",
        },
      },
    },
    watch: {
      less: {
        files: ["assets/css/**/*.less"],
        tasks: ["less"],
      },
    },
  });

  grunt.loadNpmTasks("grunt-contrib-less");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("default", ["less", "watch"]);
};
