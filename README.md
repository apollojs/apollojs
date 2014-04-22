# apollojs

apollojs is designed to extend global objects with advanced features.

## Server

Apollo server extended global objects, providing features like `$wrap`,
`Object.isEqual()`, `Object.project()`, `Array.prototype.min()` etc.

### Install

    npm install --save apollojs

### Usage

    require('apollojs');

After insert this at the begining of your entry file, all your scripts could
enjoy new featuers (as Apollo extended global objects, no need to require it
everytime you use.)

## Client

Apollo client providing a series of shorthand functions to manipulate DOM, SVG
elements. providing standard `addEventListener`, `removeEventListener` to IE8
(in case you need it, but you may need to build with `OPTIONS`.)

### Install

    bower install apollojs

### Build

Apollo is written with pjs, you may enable/disable a feature with macros.

Supported macros:

- APOLLO_IE8 IE8 support
- APOLLO_SVG SVG support

eg. Build with IE8 support

    OPTIONS="-DAPOLLO_IE8" make clean client
