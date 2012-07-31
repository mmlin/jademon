#! /usr/bin/env node

// Monitors for changes to Jade templates in a directory and its subdirectories.
// If it finds any, then it compiles them.

// Required modules.
var exec = require('child_process').exec,
    fs = require('fs'),
    path = require('path');

// Create a class to contain config settings, and runtime variables.
function JadeMon(options) {
    this.dir = '.';
    this.jadeCommand = 'jade "' + this.dir + '"';
    this.lastCompile = null;
    this.compileCount = 0;
    this.pollingInterval = 2000;
}

// Attach functions and other non-variable stuff to the prototype.
// Not that it really matters for this use case, since we only create one instance (so far).
JadeMon.prototype = {
    
    constructor: JadeMon,
    
    // Compiles the Jade templates asynchronously.
    compile: function() {
        this.compileCount++;
        this.lastCompile = new Date;
        exec(this.jadeCommand, function(err, stdout, stderr) {
            console.log(stdout);
        });
    },
    
    // Compiles Jade templates if one has been updated since the last compile.
    compileIfUpdated: function(dir, compileCount) {
    
        // Create a closure on this, so this instance is available to the callbacks below.
        var jademon = this;
        
        // If we've already compiled in this directory scan, then end early.
        if (compileCount != this.compileCount) return;
        
        // Check each file and subdirectory in the current directory.
        fs.readdir(dir, function(err, files) {
            if (err) return;
            if (compileCount != jademon.compileCount) return;
            for (var i = 0; i < files.length; i++) {
            
                // Create a closure to remember fullpath for the fs.stat callback.
                (function() {
                    var file = files[i];
                    var fullpath = path.join(dir, file);
                    
                    // Check whether each file is a file vs. directory.
                    fs.stat(fullpath, function(err, stats) {
                        if (err) return;
                        if (compileCount != jademon.compileCount) return;
                        
                        // If this is a Jade template, and it's been modified
                        // since the last compile, then compile it again.
                        // For subdirectories, step into it and check those files too.
                        if (stats.isFile() && fullpath.substr(-5) == '.jade') {
                            if (!jademon.lastCompile || stats.mtime.getTime() > jademon.lastCompile.getTime()) {
                                jademon.compile();
                            }
                        } else if (stats.isDirectory()) {
                            jademon.compileIfUpdated(fullpath, compileCount);
                        }
                    });
                }());
            }
        });
    },
    
    // This is how it all gets kicked off.
    run: function() {
        var jademon = this;
        jademon.compile();
        jademon.timer = setInterval(function() {
            if (jademon.lastStatus != jademon.lastCompile) {
                jademon.lastStatus = jademon.lastCompile;
                console.log('Monitoring for changes since ' + jademon.lastCompile + '...');
            }
            jademon.compileIfUpdated.call(jademon, jademon.dir, jademon.compileCount);
        }, this.pollingInterval);
    }
}

// This is the "main" function.
if (require.main === module) {
    var app = new JadeMon;
    app.run();
}
