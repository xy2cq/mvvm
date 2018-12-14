function MVVM(options) {
    this.$options = options || {};
    var data = this._data = this.$options.data;
    // 数据代理
    // 实现 vm.xxx -> vm._data.xxx
    Reflect.ownKeys(data).forEach((key)=>{
        this._proxyData(key);
    });

    this._initComputed();
    observe(data, this);

    this.$compile = new Compile(options.el || document.body, this);    
    this._initWatch();
}

MVVM.prototype = {
    _proxyData: function(key) {
        Reflect.defineProperty(this, key, {
            configurable: false,
            enumerable: true,
            get: function () {
                return this._data[key];
            },
            set: function (newVal) {
                this._data[key] = newVal;
            }
        });
    },

    _initComputed: function() {
        var computed = this.$options.computed;
        if (typeof computed === 'object') {
            Reflect.ownKeys(computed).forEach((key) => {
                Reflect.defineProperty(this, key, {
                    get: typeof computed[key] === 'function' 
                            ? computed[key] 
                            : computed[key].get,
                    set: function() {}
                });
            });
        }
    },
    _initWatch: function(){
        var watch = this.$options.watch;
        if (typeof watch === 'object') {
            Reflect.ownKeys(watch).forEach((key) => {
                var cb = typeof watch[key]  === 'function' ? watch[key] : watch[key].get;
                new Watcher(this, key, cb);
            });
        }
    }
};