var spec = require('./lib/spec')
var prompt = require('prompt')
prompt.start()

var modPath = '../../server_mods/com.wondible.pa.wreckage/'
var stream = 'stable'
var media = require('./lib/path').media(stream)

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    copy: {
      mod: {
        files: [
          {
            src: [
              'modinfo.json',
              'LICENSE.txt',
              'README.md',
              'CHANGELOG.md',
              'com.wondible.pa.wreckage/**',
              'ui/**',
              'pa/**'],
            dest: modPath,
          },
        ],
      },
    },
    jsonlint: {
      all: {
        src: [
          'pa/units/**/*.json'
        ]
      },
    },
    json_schema: {
      all: {
        files: {
          'lib/schema.json': [
            'pa/units/**/*.json'
          ]
        },
      },
    },
    proc: {
      base: {
        targets: [
          'pa*/units/air/**/base_*.json',
          'pa*/units/land/**/base_bot.json',
          'pa*/units/land/**/base_vehicle.json',
          'pa*/units/orbital/**/base_*.json',
          'pa*/units/sea/**/base_*.json'
        ],
        process: function(spec) {
          spec.wreckage = {
            "collision": [
              "none"
            ], 
            "remove_ground_cost_stamp": true
          }, 
          spec.wreckage_health_frac = 2
        }
      },
      structure: {
        targets: [
          'pa*/units/land/**/base_structure.json',
        ],
        process: function(spec) {
          spec.wreckage_health_frac = 2
        }
      },
      titans: {
        targets: [
          'pa*/units/air/titan_air/titan_air.json',
          'pa*/units/land/titan_bot/titan_bot.json',
          'pa*/units/land/titan_vehicle/titan_vehicle.json',
          'pa*/units/orbital/titan_orbitaltitan_orbital.json',
        ],
        process: function(spec) {
          spec.wreckage = {
            "collision": [
              //"none"
            ], 
            "remove_ground_cost_stamp": false
          }, 
          delete spec.wreckage_health_frac
        }
      },
      explicit: {
        targets: [
          'pa*/units/land/bot_nanoswarm/bot_nanoswarm.json',
          'pa*/units/land/bot_support_commander/bot_support_commander.json',
          'pa*/units/land/land_barrier/land_barrier.json',
          'pa*/units/orbital/**/defense_satellite.json',
          'pa*/units/orbital/**/orbital_battleship.json',
          'pa*/units/orbital/**/orbital_factory.json',
          'pa*/units/orbital/**/orbital_fighter.json',
          'pa*/units/orbital/**/orbital_railgun.json',
        ],
        process: function(spec) {
          delete spec.wreckage
          delete spec.wreckage_health_frac
        }
      },
      metaldamage: {
        targets: [
          'pa*/units/land/bot_nanoswarm/bot_nanoswarm_ammo.json',
        ],
        process: function(spec) {
          spec.damage = spec.damage * 0.25
        }
      },
    }
  });

  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-jsonlint');
  grunt.loadNpmTasks('grunt-json-schema');

  grunt.registerMultiTask('proc', 'Process unit files', function() {
    if (this.data.targets) {
      var specs = spec.copyPairs(grunt, this.data.targets, media)
      spec.copyUnitFiles(grunt, specs, this.data.process)
    } else {
      var specs = this.filesSrc.map(function(s) {return grunt.file.readJSON(media + s)})
      var out = this.data.process.apply(this, specs)
      grunt.file.write(this.data.dest, JSON.stringify(out, null, 2))
    }
  })

  // Default task(s).
  grunt.registerTask('default', ['proc', 'json_schema', 'jsonlint', 'copy:mod']);

};

