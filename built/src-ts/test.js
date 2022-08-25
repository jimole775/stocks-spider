"use strict";
var fs = require('fs');
console.log(global);
console.log(window);
var Ac = /** @class */ (function () {
    function Ac() {
        this.name = 'ac';
        this.to = 123;
    }
    return Ac;
}());
var ac = new Ac();
console.log(ac.to);
