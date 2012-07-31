jademon
=======

Monitors for changes to Jade templates in a directory and its subdirectories.
If it finds any, then it compiles them.

Installing
----------

Jademon requires that you have Jade installed as a global package.

    [sudo] npm install -g jade
    [sudo] npm install -g jademon

Usage
-----

Nagivate to the root directory that contains all your Jade templates, and then:

    jademon

Your directory and its subdirectories will be polled periodically.
Any changes to files named `*.jade` will automatically be compliled to `*.html`.
