var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function take() {
    return function () {
        console.log('take');
    };
}
var Constr = /** @class */ (function () {
    function Constr() {
        this.a = 1;
    }
    Constr.prototype.run = function () {
        console.log('run');
    };
    __decorate([
        take()
    ], Constr.prototype, "run");
    return Constr;
}());
var a = new Constr();
a.run();
function test() {
    return Promise.resolve(1);
}
var obj = {};
