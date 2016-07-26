//Backbone.Model.prototype.url = function () {
//    var base = _.result(this, 'urlRoot') || _.result(this.collection, 'url') || urlError();
//    if (this.isNew()) return base;
//    if (base.charAt(base.length - 1) === '/') {
//        base = base.substring(0, base.length - 1);
//    }
//    return base + '(' + encodeURIComponent(this.id) + ')';
//}
Backbone.Model.prototype.generateGuid = function guid() {
    function _p8(s) {
        var p = (Math.random().toString(16) + "000000000").substr(2, 8);
        return s ? "-" + p.substr(0, 4) + "-" + p.substr(4, 4) : p;
    }
    return _p8() + _p8(true) + _p8(true) + _p8();
}