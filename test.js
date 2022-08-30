var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
function dec() {
    console.log('dec origin');
    return function (a, b, c) {
        console.log('dec return', a, b, c);
    };
}
var TNT = /** @class */ (function () {
    function TNT() {
    }
    TNT.prototype.entity = function (a, b, c) {
        console.log('entity');
    };
    __decorate([
        dec()
    ], TNT.prototype, "entity");
    return TNT;
}());
var tnt = new TNT();
tnt.entity(1, 2, 3);
