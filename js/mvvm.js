function MVVM(options) {
    this.$options = options || {};
    var data = this._data = this.$options.data;
    var me = this;

    // 数据代理
    // 实现 vm.xxx -> vm._data.xxx
    Object.keys(data).forEach(function(key) {
        me._proxyData(key);
    });

    this._initComputed();
    observe(data, this);

    this.$compile = new Compile(options.el || document.body, this);    
    this._initWatch();
}

MVVM.prototype = {
    _proxyData: function(key, setter, getter) {
        var me = this;
        setter = setter || 
        Object.defineProperty(me, key, {
            configurable: false,
            enumerable: true,
            get: function proxyGetter() {
                return me._data[key];
            },
            set: function proxySetter(newVal) {
                me._data[key] = newVal;
            }
        });
    },

    _initComputed: function() {
        var me = this;
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Object.keys(computed).forEach(function(key) {
                Object.defineProperty(me, key, {
                    get: typeof computed[key] === 'function' 
                            ? computed[key] 
                            : computed[key].get,
                    set: function() {}
                });
            });
        }
    },
    _initWatch: function(){
        var me = this;
        var watch = this.$options.watch;
        if (typeof watch === 'object') {
            Object.keys(watch).forEach(function(key) {
                var cb = typeof watch[key]  === 'function' ? watch[key] : watch[key].get;
                new Watcher(me, key, cb);
            });
        }
    }
};