/**
 * JavaScript数据引擎
 * 基于Restful
 *
 */
(function ($) {
    var DB = window.DB = {};
    DB.OptionBase = {};
    DB.Sync = {};
    DB.DBObject = {};
    DB.Utils = {};
    DB.DB = DB;
    DB.Logs = {}; //用于存放数据库操作日志
    DB.Debug = false; //默认关闭DB debug 模式
    DB.instants = {};
    DB.config = {  //配置报错的方法
        errorcallback:function (error) {
            setTimeout(function() {
                if(error.msg) {
                    if(interaction_view){
                        interaction_view.errorAlert(error.msg);
                    }else{
                        global.message("error", error.msg);
                    }
                }
            },300); //延时弹出窗口,否则会跟点击事件重合
        }
    }
    /**
     * 程序主入口,通过new DB.DBObject(args)进行初始化一个对象
     * @type {DB.DBObject}
     */
    var DBObject = DB.DBObject = function (className) {
        var me = this;
        if (!className) {
            console.log("对不起,参数className不能为空!");
            return false;
        }
        me.className = className; //数据表名
        me.baseUrl = "/v2/api";
        DB.instants[className] = me;
    };

    DBObject.prototype = {
        /**
         * 扩展DBObject对象,为DBObject增加属性.
         * @param object:Object对象
         * @returns {*|Object}
         */
        extend: function (object) {
            return Utils.extend(this, object, true);
        },
        /**
         * 保存数据表结构信息
         * @param isFormateJSON:是否格式化JSON数据
         * @param callbackJSON:回调函数
         */
        saveTable: function (isFormateJSON, successCallback, errorCallback) {
            var me = this;
            if (isFormateJSON == undefined) isFormateJSON = true;
            me.post(me.baseUrl + "/tables/", isFormateJSON ? JSON.stringify(me) : me, successCallback, errorCallback);
        },
        /**
         * 通过get方法获取DBObject
         * @param tableId 数据表id
         * @returns {DB.DBObject} 返回DBObject,可以直接对其进行操作.
         */
        getTableObject: function (tableId) {
            var me = this;
            var obj = new DBObject(tableId);
            me.options(me.baseUrl + "/tables/" + tableId + "/", {}, function (data, response) {
                if (data.code == "200") {
                    Utils.extend(obj, data.data.results, false);
                }
            }, function (response) {
                obj = null;
            }, false);
            return obj;
        },
        /**
         * 将普通Object变成Table使用的DBObject
         * @param data 普通Object
         * @returns {DB.DBObject}
         */
        convert2Table: function (data) {
            var table = new DB.DBObject(data.className);
            Utils.extend(table, data, false);
            return table;
        },
        /**
         * 获取字段列表
         * @param tableId 数据表id
         * @param callbackJSON 回调函数
         */
        getTableFields: function (tableId, successCallback, errorCallback) {
            var me = this;
            me.options(me.baseUrl + '/tables/' + tableId + '/', {}, successCallback, errorCallback);
        },
        /**
         * 更新数据表结构
         * @param isFormateJSON 是否序列化JSON
         * @param tableId 数据表id
         * @param callbackJSON 回调函数
         */
        updateTable: function (isFormateJSON, tableId, data, callback, errorCallback) {
            var me = this;
            if (isFormateJSON == undefined) isFormateJSON = true;
            me.put(me.baseUrl + "/tables/" + tableId + "/", isFormateJSON ? JSON.stringify(data) : data, callback, errorCallback);
        },
        /**
         * 删除数据表
         * @param tableId 数据表id
         * @param callbackJSON
         */
        deleteTable: function (tableId, successCallback, errorCallback) {
            var me = this;
            me.delete(me.baseUrl + "/tables/" + tableId + "/", {}, successCallback, errorCallback);
        },
        /**
         * 获取数据表规则,只返回数据表规则和用户信息,不返回字段信息
         * @param tableId 数据表id
         * @returns {{}}
         */
        getTableRules: function (tableId) {
            var me = this,
                rules = {};
            me.get(me.baseUrl + "/tables/" + tableId + "/info/", {}, function (data, respone) {
                // rules = data;
                if (data) {
                    var userInfo = data.data.results[0].user_info;
                    var tableInfo = data.data.results[0].table_rule;
                    Utils.extend(rules, userInfo, false);
                    Utils.extend(rules, tableInfo, false);
                }
            }, function () {
                rules = {};
            }, false);
            return rules;
        },
        /**
         * 向数据库新增一条记录
         * @param isFormateJSON 是否序列号数据
         * @param tableId 数据表id
         * @param data 记录数据JSON
         * @param callbackJSON 回调函数
         */
        flushRecord: function (isFormateJSON, tableId, data, successCallback,errorCallback) {
            var me = this;
            me.post(me.baseUrl + "/tables/" + tableId + "/objects/", isFormateJSON ? JSON.stringify(data) : data, successCallback);
        },
        /**
         * 更新一条指定记录
         * @param isFormateJSON 是否序列化数据
         * @param tabldId 数据表id
         * @param cid 数据记录id
         * @param data 记录数据JSON
         * @param callbackJSON 回调函数
         */
        updateRecord: function (isFormateJSON, tableId, cid, data, successCallback,errorCallback) {
            var me = this;
            if (cid) {
                me.put(me.baseUrl + "/tables/" + tableId + "/objects/" + cid + "/", isFormateJSON ? JSON.stringify(data) : data, successCallback);
            } else {
                // errorCallback();
                DB.config.errorcallback();
            }
        },
        /**
         * 删除一条指定记录
         * @param tableId 数据表ID
         * @param cid 数据记录id
         * @param callbackJSON 回调函数
         */
        deleteRecord: function (tableId, cid, successCallback,errorCallback) {
            var me = this;
            me.delete(me.baseUrl + "/tables/" + tableId + "/objects/" + cid + "/", {}, successCallback);
        },
        /**
         * 批量删除指定记录
         * @param tableId 数据表id
         * @param objectIds 数据记录id 数组
         * @param successCallback 执行成功回调函数
         * @param errorCallback 执行失败回调
         * @returns {boolean}
         */
        deleteRecords: function (tableId, objectIds, successCallback, errorCallback) {
            var me = this;
            me.delete(me.baseUrl + "/tables/" + tableId + "/objects/", {"ids": objectIds}, successCallback, errorCallback);
        },
        /**
         * 批量保存或者修改记录
         * @param isFormateJSON 是否序列化数据对象,一般为true
         * @param tableId 数据表id
         * @param data_Arr 数据数组,Array,内部根据Item是否存在id属性判定是新增还是修改
         * @param successCallback 执行成功回调
         * @param errorCallback 执行失败回调
         */
        saveOrUpdateRecord: function (isFormateJSON, tableId, data_Arr, successCallback, errorCallback) {
            var me = this;
            me.post(me.baseUrl + "/tables/" + tableId + "/objects/", isFormateJSON ? JSON.stringify(data_Arr) : data_Arr, successCallback, errorCallback);
        }
    };

    /**
     * 配置页码信息
     * @type {DB.DBConfig}
     * @param recordCount:每页显示页码数
     */
    var DBConfig = DB.DBConfig = function (recordCount) {
        this.hit = recordCount || 0;//每页显示记录数
        this.start = 0;//起始记录index值
    };
    DBConfig.prototype = {
        /**
         * 按照行数查询某一条记录
         * @param start 行数
         * @returns {DBConfig}
         */
        setStart: function (start) {
            var me = this;
            this.start = start;
            return me;
        },
        /**
         * 设置页码
         * @param page_num 设置需要跳转的页码
         * @returns {DBConfig}
         */
        setPage: function (page_num) {
            var me = this;
            me.start = me.hit * page_num;
            return me;
        },
        /**
         * 获取页码
         * @returns {number}
         */
        getPage: function () {
            return this.start / this.hit;
        },
        /**
         * 跳转到下一页
         * @returns {DBConfig}
         */
        nextPage: function () {
            var me = this;
            me.start += me.hit;
            return me;
        },
        /**
         * 跳转到上一页
         * @returns {DBConfig}
         */
        prevPage: function () {
            var me = this;
            me.start -= me.hit;
            if (me.start < 0)me.start = 0;
            return me
        },
        /**
         * 重新设置每页显示页码,覆盖初始化的时候设置的值
         * @param recordCount
         */
        setCount: function (recordCount) {
            var me = this;
            me.hit = recordCount;
            return this;
        },
        /**
         * 获取每页的记录数
         * @returns {*}
         */
        getCount: function () {
            return this.hit;
        }
    };


    var DBAggregate = DB.DBAggregate = function (group_id) {
        Utils.setOpt(this, "group_key", group_id);
    };
    DBAggregate.prototype = {
        /**
         * 对id字段求和
         * @param id 字段id
         * @returns {DB.DBAggregate}
         */
        sum: function (id) {
            var fun = Utils.getOpt(this, "agg_fun") || "";
            Utils.setOpt(this, "agg_fun", fun == "" ? "sum(" + id + ")" : fun + "#sum(" + id + ")");
            return this;
        },
        /**
         * 对id字段求最大值
         * @param id 字段id
         * @returns {DB.DBAggregate}
         */
        max: function (id) {
            var fun = Utils.getOpt(this, "agg_fun") || "";
            Utils.setOpt(this, "agg_fun", fun == "" ? "max(" + id + ")" : fun + "#max(" + id + ")");
            return this;
        },
        /**
         * 对id字段求最小值
         * @param id 字段id
         * @returns {DB.DBAggregate}
         */
        min: function (id) {
            var fun = Utils.getOpt(this, "agg_fun") || "";
            Utils.setOpt(this, "agg_fun", fun == "" ? "min(" + id + ")" : fun + "#min(" + id + ")");
            return this;
        },
        /**
         * 求文档个数
         * 与max/min/sum
         * @returns {DB.DBAggregate}
         */
        count: function () {
            var fun = Utils.getOpt(this, "agg_fun") || "";
            Utils.setOpt(this, "agg_fun", fun == "" ? "count()" : fun + "#count()");
            return this;
        },
        /**
         * 表示分段统计，可用于分布统计，支持多个range参数。
         * 表示number1~number2及大于number2的区间情况。不支持string类型的字段分布统计。
         * @param num1
         * @param num2
         * @returns {DB.DBAggregate}
         */
        setRange: function (num1, num2) {
            Utils.setOpt(this, "range", num1 + "~" + num2);
            return this;
        },
        /**
         * 非必须参数，表示仅统计满足特定条件的文档；
         * @param filter:DBFilter
         */
        setFilter: function (filter) {
            Utils.setOpt(this, "agg_filter", filter);
            return this;
        },
        /**
         * 非必须参数，抽样统计的阈值。
         * @param num 表示该值之前的文档会依次统计，该值之后的文档会进行抽样统计；
         * @param step 抽样统计的步长。表示从agg_sampler_threshold后的文档将间隔agg_sampler_step个文档统计一次。对于sum和count类型的统计会把阈值后的抽样统计结果最后乘以步长进行估算，估算的结果再加上阈值前的统计结果就是最后的统计结果。
         * @returns {DB.DBAggregate}
         */
        setSamplerThreshold: function (num, step) {
            Utils.setOpt(this, "agg_sampler_threshold", num);
            Utils.setOpt(this, "agg_sampler_step", step);
            return this;
        },
        /**
         * 最大返回组数
         * @param group_number
         * @returns {DB.DBAggregate}
         */
        setMaxGroup: function (group_number) {
            Utils.setOpt(this, "max_group", group_number);
            return this;
        }
    };
    var DBLimit = DB.DBLimit = function () {

    };
    DBLimit.prototype = {
        /**
         * 等于
         * 生成两对K/V
         * ```javascript
         * {
         *      key:"title",
         *      value:"张三"
         * }
         * ```
         * @param key
         * @param value
         */
        equalTo: function (key, value) {
            Utils.setOpt(this, "key", key);
            Utils.setOpt(this, "value", value);
            return this;
        },
        /**
         * 与运算符,将两个查询条件用与运算符连接,
         * @param obj 可以是字典或者一个JSON
         * ```javascript
         *   DBLimit.and(DBLimit)
         * ```
         * @returns {DB.DBLimit}
         */
        and: function (obj) {
            var newDB = {
                opt: "AND",
                values: []
            }, me = this;
            newDB.values.push(this);
            if (Utils.isArray(obj)) {
                Utils.each(obj, function (item) {
                    newDB.values.push(item);
                });
            } else {
                newDB.values.push(obj);
            }
            var limit = new DBLimit();
            limit.statement = newDB;
            return limit;
        },
        /**
         * 或运算符,将两个查询条件用与运算符连接,包含A或者包含B
         * @param obj 可以是字典或者一个JSON
         * ```javascript
         *   A.or(B)
         * ```
         * @returns {DB.DBLimit}
         */
        or: function (obj) {
            var newDB = {
                opt: "OR",
                values: []
            }, me = this;
            newDB.values.push(this);
            if (Utils.isArray(obj)) {
                Utils.each(obj, function (item) {
                    newDB.values.push(item);
                });
            } else {
                newDB.values.push(obj);
            }
            var limit = new DBLimit();
            limit.statement = newDB;
            return limit;
        },
        /**
         * 包含A且不包含B
         * @param obj 可以是字典或者一个JSON
         * ```javascript
         * A.and_not(B)
         * ```
         * @returns {DB.DBLimit}
         */
        and_not: function (obj) {
            var newDB = {
                opt: "ANDNOT",
                values: []
            }, me = this;
            newDB.values.push(this);
            if (Utils.isArray(obj)) {
                Utils.each(obj, function (item) {
                    newDB.values.push(item);
                });
            } else {
                newDB.values.push(obj);
            }
            var limit = new DBLimit();
            limit.statement = newDB;
            return limit;
        },
        /**
         * 排序优先级
         * eg:RANK title:'校长' :若title中包含“校长”则排序上排在前面；
         * @param obj 可以是字典或者一个JSON
         * @returns {DB.DBLimit}
         */
        rank: function (obj) {
            var newDB = {
                opt: "RANK",
                values: []
            }, me = this;
            newDB.values.push(this);
            if (Utils.isArray(obj)) {
                Utils.each(obj, function (item) {
                    newDB.values.push(item);
                });
            } else {
                newDB.values.push(obj);
            }
            var limit = new DBLimit();
            limit.statement = newDB;
            return limit;
        }
    };

    var DBFilter = DB.DBFilter = function (filter) {
        if (filter && filter.key) {
            var prop = this.analysz(filter.value);
            this.key = filter.key;
            Utils.extend(this, prop, false);
        }
    };
    DBFilter.prototype = {
        analysz: function (statement) {
            var prop = {
                option: "=",
                value: ""
            };
            statement = statement + "";
            var new_statement = Utils.trim(statement, "g");
            var optArr = ["<", "<=", ">", ">=", "=", "!="];
            var flag = 0;
            if (new_statement) {
                Utils.each(optArr, function (opts) {
                    if (new_statement.indexOf(opts) == 0) {
                        flag = 1;
                        prop.option = opts;
                        prop.value = new_statement.substr(opts.length);
                    }
                });
                if (flag == 0) {
                    prop.option = "=";
                    prop.value = statement;
                }
            }
            return prop;
        },

        /**
         * 与运算符,将两个查询条件用与运算符连接,
         * @param obj
         * ```javascript
         *   DBLimit.and(DBLimit)
         * ```
         * @returns {DB.DBLimit}
         */
        and: function (obj) {
            var newDB = {
                opt: "AND",
                values: []
            }, me = this;
            newDB.values.push(this);
            if (Utils.isArray(obj)) {
                Utils.each(obj, function (item) {
                    newDB.values.push(item);
                });
            } else {
                newDB.values.push(obj);
            }

            var flag = 0;
            Utils.each(newDB.values, function (value) {
                if (value.value) {
                    flag = 1;
                }
            });
            if (flag == 0) {
                return me;
            } else {
                var filter = new DBFilter();
                filter.statement = newDB;
                return filter;
            }
        },
        /**
         * 或运算符,将两个查询条件用与运算符连接,包含A或者包含B
         * @param obj
         * ```javascript
         *   A.or(B)
         * ```
         * @returns {DB.DBLimit}
         */
        or: function (obj) {
            var newDB = {
                opt: "OR",
                values: []
            }, me = this;
            newDB.values.push(this);
            if (Utils.isArray(obj)) {
                Utils.each(obj, function (item) {
                    newDB.values.push(item);
                });
            } else {
                newDB.values.push(obj);
            }
            // var filter = new DBFilter();
            // filter.statement = newDB;
            // return filter;
            var flag = 0;
            Utils.each(newDB.values, function (value) {
                if (value.value) {
                    flag = 1;
                }
            });
            if (flag == 0) {
                return me;
            } else {
                var filter = new DBFilter();
                filter.statement = newDB;
                return filter;
            }
        },
        /**
         * 包含A且不包含B
         * @param obj
         * ```javascript
         * A.and_not(B)
         * ```
         * @returns {DB.DBLimit}
         */
        and_not: function (obj) {
            var newDB = {
                opt: "ANDNOT",
                values: []
            }, me = this;
            newDB.values.push(this);
            if (Utils.isArray(obj)) {
                Utils.each(obj, function (item) {
                    newDB.values.push(item);
                });
            } else {
                newDB.values.push(obj);
            }
            // var filter = new DBFilter();
            // filter.statement = newDB;
            // return filter;
            var flag = 0;
            Utils.each(newDB.values, function (value) {
                if (value.value) {
                    flag = 1;
                }
            });
            if (flag == 0) {
                return me;
            } else {
                var filter = new DBFilter();
                filter.statement = newDB;
                return filter;
            }
        },
        /**
         * 等于
         * @param key
         * @param value
         */
        equalTo: function (key, value) {
            Utils.setOpt(this, "key", key);
            Utils.setOpt(this, "value", value);
            Utils.setOpt(this, "option", "=");
            return this;
        },
        /**
         * 不等于
         * @param key
         * @param value
         */
        notEqualTo: function (key, value) {
            Utils.setOpt(this, "key", key);
            Utils.setOpt(this, "value", value);
            Utils.setOpt(this, "option", "!=");
            return this;
        },
        /**
         * 属性key小于value值,只对可以排序的类型有效
         * @param key
         * @param value
         */
        lessThan: function (key, value) {
            Utils.setOpt(this, "key", key);
            Utils.setOpt(this, "value", value);
            Utils.setOpt(this, "option", "<");
            return this;
        },
        /**
         * 属性key小于等于value值,只对可以排序的类型有效
         * @param key
         * @param value
         */
        lessThanOrEqualTo: function (key, value) {
            Utils.setOpt(this, "key", key);
            Utils.setOpt(this, "value", value);
            Utils.setOpt(this, "option", "<=");
            return this;
        },
        /**
         * 属性key大于value值,只对可以排序的类型有效
         * @param key
         * @param value
         */
        greaterThan: function (key, value) {
            Utils.setOpt(this, "key", key);
            Utils.setOpt(this, "value", value);
            Utils.setOpt(this, "option", ">");
            return this;
        },
        /**
         * 属性key大于等于value值,只对可以排序的类型有效
         * @param key
         * @param value
         */
        greaterThanOrEqualTo: function (key, value) {
            Utils.setOpt(this, "key", key);
            Utils.setOpt(this, "value", value);
            Utils.setOpt(this, "option", ">=");
            return this;
        }

    };
    var DBQuery = DB.DBQuery = function () {
        var me = this;
        me.aggregate = [];
        me.baseUrl = "/v2/api";
        //me.query = {};
        //me.filter = {};
    };
    //查询操作
    DBQuery.prototype = {
        /**
         * 将统计对象加入到Query队列中
         * @param Aggregate 统计对象 DBAggregate
         * @returns {DB.DBQuery}
         */
        addAggregate: function (Aggregate) {
            var me = this;
            if (Aggregate) {
                me.aggregate.push(Aggregate);
            }
            return this;
        },
        /**
         * 为DBQuery对象增加或修改查询对象
         * @param Limit DBLimit对象
         * @returns {DB.DBQuery}
         */
        addLimit: function (Limit) {
            var me = this;
            if (Limit) {
                me.query = Limit;
            }
            return this;
        },
        /**
         * 为DBQuery对象增加一个过滤对象
         * @param Filter DBFilter对象
         * @returns {DB.DBQuery}
         */
        addFilter: function (Filter) {
            var me = this;
            if (Filter) {
                me.filter = Filter;
            }
            return this;
        },
        /**
         * 为DBQuery增加排序字段
         * @param key 需要进行排序的字段
         * @param type 排序方法:升序(+) / 降序(-)
         * @returns {DB.DBQuery}
         */
        addSort: function (key, type) {
            if (!key || !type) {
                return this;
            }
            if (!this.sort) this.sort = [];
            var way = type.toUpperCase() == 'ASC' ? '+' : '-';
            this.sort.push(way + key);
            return this;
        },
        /**
         * 为DBQuery增加配置字段,配置页面信息
         * @param Config DBConfig对象
         * @returns {DB.DBQuery}
         */
        addConfig: function (Config) {
            var me = this;
            if (Config) {
                me.config = Config;
            }
            return this;
        },
        /**
         * 为DBQuery增加一条可执行的SQL语句,后端直接执行SQL语句
         * @param sql String
         * @returns {DB.DBQuery}
         */
        addSQL: function (sql) {
            var me = this;
            me.execSQL = sql;
            return me;
        },
        /**
         * 为DBQuery增加显示字段信息
         * @param fields 数组,需要显示的字段名
         * @returns {DB.DBQuery}
         */
        addFields: function (fields) {
            var me = this;
            if (!me.fetch_fields) me.fetch_fields = [];
            if (Utils.isArray(fields)) {
                Utils.each(fields, function (field) {
                    me.fetch_fields.push(field);
                })
            }
            return me;
        },
        /**
         * 为DBQuery增加一个作用域
         * @param scopeType * 作用域类型
         * @returns {DB.DBQuery}
         */
        addScope: function (scopeType) {
            var me = this;
            me.scope = scopeType;
            return me;
        },
        /**
         * 将DBQuery发送到后端执行
         * @param sendUrl 发送url
         * @param successCallback 执行成功回调
         * @param errorCallback 执行失败回调
         * @constructor
         */
        Query: function (tableId, page, size, successCallback, errorCallback, options) {
            var me = this, temp = {};
            if (!page) page = 1;
            if (!size) size = 20;
            temp = Utils.clone(me, temp);
            if (options && Utils.isObject(options)) {
                if (options.start != null && options.start != undefined) {
                    if (!temp.config) temp.config = {};
                    temp.config.start = options.start;
                    temp.config.hit = 1;
                }
            }
            if (options.id && options.id != null && options.id != undefined) {
                me.send("get", me.baseUrl + "/tables/" + tableId + "/objects/" + options.id + "/", {
                    "data": JSON.stringify(temp)
                }, successCallback, errorCallback);
            } else {
                me.send("get", me.baseUrl + "/tables/" + tableId + "/objects/", {
                    "data": JSON.stringify(temp),
                    "page": page,
                    "size": size
                }, successCallback, errorCallback);
            }
        },
        /**
         * 根据用户调用该方法的宿主,返回一个data_json
         * @ return 查询条件的字符串格式
         * @constructor
         * ```javascript
         * var query =new DB.DBQuery()
         * query.addXXX(xxx);
         * var data_json = query.JSON2Str();
         * ```
         */
        JSON2Str: function (query_id) {
            if (query_id) {
                return query_id + "/data/?data=" + encodeURIComponent(JSON.stringify(this))+"&page=1&size=20";
            }
            return null;
        }
    }
    ;
    var Sync = DB.Sync = function () {
    };
    Sync.prototype = {
        /**
         * 基本方法,用来向服务器发送一个请求:POST PUT DELETE GET
         * @param sendType : POST PUT DELETE GET
         * @param sendUrl
         * @param sendData
         * @param callbackJson
         */
        send: function (sendType, sendUrl, sendData, successCallback, errorCallback,isAsync) {
            var me = this;
            //var responseCode = Utils.extend(callbackJson, Utils.clone(defaultCode), true);
            if (sendType != null) sendType = sendType.toUpperCase();
            if (!sendUrl) return;
            if (isAsync == undefined) isAsync = true;
            if (sendType != "POST" && sendType != "PUT" && sendType != "GET" && sendType != "DELETE" && sendType != "OPTIONS") {
                console.log("对不起,请求的方法不正确!");
                return;
            }
            if (DB.Debug) {
                var logid = DB.Utils.uuid(2);
                var title = sendUrl + ' (' + sendType + ')';
                DB.Utils.log(logid, title, sendData);
            }
            $.ajax({
                type: sendType,
                url: sendUrl,
                data: sendData,
                async: isAsync,
                contentType: 'application/json',
                xhrFields: {
                    withCredentials: true
                },
                dataType: 'json',
                crossDomain: true,
                success: function (data, status, response) {
                    // data.code == 200 ? successCallback && successCallback(data, response) : errorCallback && errorCallback(data, response);
                    data.code == 200 ? successCallback && successCallback(data, response) : DB.config.errorcallback(data, response);
                    if (DB.Debug) {
                        DB.Utils.log(logid, ' Success', data, true);
                    }
                },
                error: function (data, status, response) {
                    // errorCallback && errorCallback(data, response);
                    DB.config.errorcallback(data, response);
                    if (DB.Debug) {
                        DB.Utils.log(logid, ' Fail', data, true);
                    }
                }
            });
        },
        /**
         * 发送一个Post请求,创建对象
         * 封装自Sync.send
         */
        post: function (sendUrl, sendData, successCallback, isAsync) {
            this.send("POST", sendUrl, sendData, successCallback);
        },
        /**
         * 发送一个Get请求,获取对象
         * 封装自Sync.send
         */
        get: function (sendUrl, sendData, successCallback, errorCallback, isAsync) {
            this.send("GET", sendUrl, sendData, successCallback, errorCallback, isAsync);
        },
        /**
         * 发送一个Put请求,更新对象
         * 封装自Sync.send
         */
        put: function (sendUrl, sendData, successCallback, errorCallback, isAsync) {
            this.send("PUT", sendUrl, sendData, successCallback, errorCallback);
        },
        /**
         * 发送一个Delete请求,删除对象
         * 封装自Sync.send
         */
        delete: function (sendUrl, sendData, successCallback, isAsync) {
            this.send("delete", sendUrl, sendData, successCallback);
        },
        /**
         * 发送一个Options请求,获取字段信息
         * 封装自Sync.send
         */
        options: function (sendUrl, sendData, successCallback, errorCallback, isAsync) {
            this.send("options", sendUrl, sendData, successCallback, errorCallback);
        }
    };
    var OptionBase = DB.OptionBase = function () {
    };
    OptionBase.prototype = {
        /**
         * 为一个DBObject增加一个字段,字段格式为JSON
         * @param DBObject DB的Object
         * @param field 字段JSON
         */
        addField: function (field) {
            var me = this;
            if (!me.fields) me.fields = [];
            if (field != null) {
                if (Utils.isObject(field)) {
                    me.fields.push(field);
                }
                if (Utils.isArray(field)) {
                    Utils.each(field, function (item) {
                        me.fields.push(item);
                    });
                }

            }
            return this;
        },
        /**
         * 添加DBObject的title属性
         * @param titleName
         * @returns {DB.OptionBase}
         */
        addTitle: function (titleName) {
            Utils.setOpt(this, 'title', titleName);
            return this;
        },
        /**
         * 添加DBObject的开始日期属性
         * @param startDate
         * @returns {DB.OptionBase}
         */
        addStartDate: function (startDate) {
            Utils.setOpt(this, 'startTime', startDate);
            return this;
        },
        /**
         * 添加DBObject的结束日期属性
         * @param endDate
         * @returns {DB.OptionBase}
         */
        addEndDate: function (endDate) {
            Utils.setOpt(this, 'endTime', endDate);
            return this;
        },
        /**
         * 添加DBObject的规则属性
         * @param rule
         * @returns {DB.OptionBase}
         */
        addRule: function (rule) {
            Utils.setOpt(this, 'rule', rule);
            return this;
        },
        /**
         * 添加DBObject的其他属性
         * @param key
         * @param value
         * @returns {DB.OptionBase}
         */
        addOpt: function (key, value) {
            Utils.setOpt(this, key, value);
            return this;
        },
        /**
         * 为一个DBObject更新字段,字段格式为JSON
         * @param DBObject DB的Object
         * @param field 字段JSON
         */
        updateField: function (field_id, key, value) {
            var me = this,
                fields = me.fields;
            Utils.each(fields, function (field) {
                if (field.cid == field_id) {
                    field[key] = value;
                }
            });
            return this;
        },
        /**
         * 删除一个字段,根据该字段的index值
         * @param index
         */
        // removeFiled: function (index) {
        //     this.fields.splice(index, 1);
        // },
        /**
         * 根据条件查找字段
         * @param key :查找的字段对象的key
         * @param value :找到的字段对象的Value
         * @returns {*}
         */
        getField: function (key, value) {
            var target;
            Utils.each(this.fields, function (field) {
                if (field[key] == value) {
                    target = field;
                    return false;
                }
            });
            return target;
        },
        /**
         * 查找全部Object的字段
         * @returns {Array} 字段数组
         */
        getFields: function () {
            return this.fields;
        },
        /**
         * 删除Object的指定字段
         * @param key 查找的字段对象的key
         * @param value  找到的字段对象的Value
         * ```javascript
         * dbobject.removeField('cid','i1');//删除cid=i1的字段
         * ```
         */
        removeField: function (key, fieldId) {
            var me = this,
                fields = me.fields;
            Utils.each(fields, function (field, index) {
                if (field[key] == fieldId) {
                    fields.splice(index, 1);
                    return false;
                }
            });
            return me;
        },
        /**
         * 删除Object的所有字段
         */
        removeAll: function () {
            this.fields = [];
        }

        // addReroed:
    };


    var Utils = DB.Utils = {
        trim: function (str, is_global) {
            var result;
            if (Utils.isString(str)) {
                result = str.replace(/(^\s+)|(\s+$)/g, "");
                if (is_global.toLowerCase() == "g") {
                    result = result.replace(/\s/g, "");
                }
            } else {
                result = str;
            }
            return result;
        },
        /**
         * 用给定的迭代器遍历对象
         * @method each
         * @param { Object } obj 需要遍历的对象
         * @param { Function } iterator 迭代器， 该方法接受两个参数， 第一个参数是当前所处理的value， 第二个参数是当前遍历对象的key
         * @example
         * ```javascript
         * var demoObj = {
         *     key1: 1,
         *     key2: 2
         * };
         *
         * //output: key1: 1, key2: 2
         * Utils.each( demoObj, funciton ( value, key ) {
         *
         *     console.log( key + ":" + value );
         *
         * } );
         * ```
         */
        each: function (obj, iterator, context) {
            if (obj == null) return;
            if (obj.length === +obj.length) {
                for (var i = 0, l = obj.length; i < l; i++) {
                    if (iterator.call(context, obj[i], i, obj) === false)
                        return false;
                }
            } else {
                for (var key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        if (iterator.call(context, obj[key], key, obj) === false)
                            return false;
                    }
                }
            }
        },
        /**
         * 该方法是提供给插件里面使用，添加一个JSON的KEY/VALUE
         * @method setOpt
         * @warning 该方法仅供编辑器插件内部和编辑器初始化时调用，其他地方不能调用。
         * @param { Object } source 源对象
         * @param { String } key JSON可接受的选项名称
         * @param { * } val  该选项可接受的值
         * @example
         * ```javascript
         * Utils.setOpt(source , 'name', '张三' );
         * ```
         */
        setOpt: function (source, key, val) {
            var obj = {};
            if (Utils.isString(key)) {
                obj[key] = val
            } else {
                obj = key;
            }
            Utils.extend(source, obj, false);
        },
        /**
         * 该方法是提供给插件里面使用，通过JSON的key获取value值
         * @param source 源对象
         * @param key JSON可接受的选项名称
         * @returns {*} key所对应的value值
         */
        getOpt: function (source, key) {
            return source[key]
        },
        /**
         * 判断某个元素是否在给定的源数组中
         * @param arr :源数组
         * @param obj :查找的元素
         * @returns {boolean} true:存在,false:不存在
         */
        contains: function (arr, obj) {
            var i = arr.length;
            while (i--) {
                if (arr[i] === obj) {
                    return true;
                }
            }
            return false;
        },
        /**
         * 深度克隆对象，将source的属性克隆到target对象， 会覆盖target重名的属性。
         * @method clone
         * @param { Object } source 源对象
         * @param { Object } target 目标对象
         * @return { Object } 附加了source对象所有属性的target对象
         */
        clone: function (source, target) {
            var tmp;
            target = target || {};
            for (var i in source) {
                if (source.hasOwnProperty(i)) {
                    tmp = source[i];
                    if (typeof tmp == 'object') {
                        target[i] = Utils.isArray(tmp) ? [] : {};
                        Utils.clone(source[i], target[i])
                    } else {
                        target[i] = tmp;
                    }
                }
            }
            return target;
        },
        /**
         * 模拟继承机制， 使得subClass继承自superClass
         * @method inherits
         * @param { Object } subClass 子类对象
         * @param { Object } superClass 超类对象
         * @warning 该方法只能让subClass继承超类的原型， subClass对象自身的属性和方法不会被继承
         * @return { Object } 继承superClass后的子类对象
         * @example
         * ```javascript
         * function SuperClass(){
         *     this.name = "小李";
         * }
         *
         * SuperClass.prototype = {
         *     hello:function(str){
         *         console.log(this.name + str);
         *     }
         * }
         *
         * function SubClass(){
         *     this.name = "小张";
         * }
         *
         * Utils.inherits(SubClass,SuperClass);
         *
         * var sub = new SubClass();
         * //output: '小张早上好!
         * sub.hello("早上好!");
         * ```
         */
        inherits: function (subClass, superClass) {
            var oldP = subClass.prototype,
                newP = Utils.makeInstance(superClass.prototype);
            Utils.extend(newP, oldP, true);
            subClass.prototype = newP;
            return (newP.constructor = subClass);
        },
        /**
         * 将source对象中的属性扩展到target对象上， 根据指定的isKeepTarget值决定是否保留目标对象中与
         * 源对象属性名相同的属性值。
         * @method extend
         * @param { Object } target 目标对象， 新的属性将附加到该对象上
         * @param { Object } source 源对象， 该对象的属性会被附加到target对象上
         * @param { Boolean } isKeepTarget 是否保留目标对象中与源对象中属性名相同的属性
         * @return { Object } 返回target对象
         * @example
         * ```javascript
         *
         * var target = { name: 'target', sex: 1 },
         *      source = { name: 'source', age: 17 };
         *
         * Utils.extend( target, source, true );
         *
         * //output: { name: 'target', sex: 1, age: 17 }
         * console.log( target );
         *
         * ```
         */
        extend: function (t, s, b) {
            if (s) {
                for (var k in s) {
                    if (!b || !t.hasOwnProperty(k)) {
                        t[k] = s[k];
                    }
                }
            }
            return t;
        },
        /**
         * 以给定对象作为原型创建一个新对象
         * @method makeInstance
         * @param { Object } protoObject 该对象将作为新创建对象的原型
         * @return { Object } 新的对象， 该对象的原型是给定的protoObject对象
         * @example
         * ```javascript
         *
         * var protoObject = { sayHello: function () { console.log('Hello World!'); } };
         *
         * var newObject = Utils.makeInstance( protoObject );
         * //output: Hello World!
         * newObject.sayHello();
         * ```
         */
        makeInstance: function (obj) {
            var noop = new Function();
            noop.prototype = obj;
            obj = new noop;
            noop.prototype = null;
            return obj;
        },
        delArray: function (arr, n) {
            if (n < 0) return this;
            return arr.slice(0, n).concat(arr.slice(n + 1, arr.length));
        },
        /**
         * 生成唯一ID
         * @method uuid
         * @param count
         * @returns {string} uuid
         */
        uuid: function (count) {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
            }

            if (!count)
                return s4() + s4() + s4() + s4() + s4() + s4() + s4() + s4();
            else {
                var r = '';
                while (count--) {
                    r = r + s4();
                }
                return r;
            }
        },
        log: function (logid, title, data, returned) {
            if (DB.Debug) {
                if (!returned) {
                    var Log = (new Date()).toLocaleTimeString() + '</br/>' + title + ' <pre>' + JSON.stringify(data) + '</pre>';
                    DB.Logs[logid] = {};
                    DB.Logs[logid]["req"] = Log;
                }
                else {
                    var Log = '<span style="margin-left:10px">' + (new Date()).toLocaleTimeString() + title + '</span> <pre>' + JSON.stringify(data) + '</pre>';
                    if (DB.Logs[logid])
                        DB.Logs[logid]["res"] = Log;
                }
            }
        }
    };
    Utils.each(['String', 'Function', 'Array', 'Number', 'RegExp', 'Object', 'Date'], function (v) {
        DB.Utils['is' + v] = function (obj) {
            return Object.prototype.toString.apply(obj) == '[object ' + v + ']';
        }
    });
    Utils.inherits(DBObject, OptionBase);
    Utils.inherits(DBObject, Sync);
    Utils.inherits(DBObject, DBQuery);
    Utils.inherits(DBQuery, Sync);
})(window.jQuery);