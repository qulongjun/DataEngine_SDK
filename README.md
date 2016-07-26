# 数据引擎SDK
## 环境与部署
DataEngine.js依赖JQuery:
```html
<script type="text/javascript" src="../jquery/jquery-1.8.1.js"></script>
<script type="text/javascript" src="dataEngine.js"></script>
```
初始化DataEngine:
```html
<script type="text/javascript">
    $(function () {
        var a = new DB.DBObject("user");
        a.addField({
             "label": "",
             "field_type": 0,
             "required": true,
             "unique": false,
             "is_random": true,
             "default": null,
             "min": 1,
             "max": 10,
             "cid": "i1, s1, f1, d1"
        });
    });
</script>
```
##DB.Object（数据对象）
###extend(object)：扩展DBObject对象
扩展Object对象，为Object实例扩展插件。内部使用Utils工具包的extend方法将JSON绑定到源Object上。

```javascript
a.extend({
  "test":function(){
     //do Something
  }
})
```
参数列表：
- object：JSON对象

###save：新建或更新数据表的结构(已废弃)
数据表与后端交互的唯一入口，save()方法将DB的Object发送给后端。
```javascript
  //do Something
  a.addField(...);
  ...
  a.save();
```
###saveTable(isFormateJSON, callbackJSON):保存数据表结构
将调用该方法的DBTable对象通过POST方法与服务器交互。
```javascript
//创建一个数据表Object项目
        var table = new DB.DBObject("65dddb10-6d11-46ad-a22a-eff592be69ea");
        /**
         * addTilte:增加一个title
         * addStartDate:起始日期
         * addEndDate:结束日期
         * addField:字段
         */
        table.addTitle("这是一个title").addStartDate("2016-05-13 11:33:48").addEndDate("2016-05-13 11:33:48").addField({
            label: "",
            field_type: 0,
            required: true,
            unique: false,
            is_random: true,
            default: null,
            min: 1,
            max: 10,
            cid: "i1, s1, f1, d1"
        })).addOpt("id", "11");
        /**
         * 保存数据表到服务器中
         */
        table.saveTable(true, {
            "201": function () {
                console.log('数据表创建成功');
            }
        });
```
参数列表：
- isFormateJSON :是否需要序列号JSON数据，通常选择true。
- callbackJSON:回调函数JSON，具体参考回调函数一章。

###getTableList(data, callbackJSON)
通过GET方法与服务器交互获取数据表列表。
```javascript
        table.getTableList({
            'className': 'test',
            'id': 111
        }, {
            "200": function (XMLHttpRequest) {
                tableList = eval('(' + XMLHttpRequest.responseText + ')').data;
                console.log(tableList.results);
            }
        });
```

参数列表：
- data :参数列表，需要通过get发送的参数JSON
- callbackJSON:回调函数JSON，具体参考回调函数一章。

###getTableFields(tableId, callbackJSON):获取字段列表
通过GET方法获取id为tableId的数据表，并返回该数据表的所有字段信息。
```javascript
        table.getTableFields("44315209-3676-4dd6-ac1a-d0f6ea16d272", {
            "200": function (XMLHttpRequest) {
                var fieldList = eval('(' + XMLHttpRequest.responseText + ')').data;
                console.log(fieldList.results);
            }
        });
```

参数列表：
- tableId:数据表ID。
- callbackJSON:回调函数JSON，具体参考回调函数一章。

###updateTable(isFormateJSON, tableId, callbackJSON):更新数据表结构
通过PUT方法更新数据表结构，更新的数据为调用该updateTable()方法的对象。
```javascript
        table.updateTable(true, "44315209-3676-4dd6-ac1a-d0f6ea16d272", {
            "200": function (XMLHttpRequest) {
                console.log('数据表修改成功');
            }
        });
```

参数列表：
- isFormateJSON :是否需要序列号JSON数据，通常选择true。
- tableId:需要进行更新操作的数据表ID。
- callbackJSON:回调函数JSON，具体参考回调函数一章。

###deleteTable(tableId, callbackJSON):删除数据表
通过DELETE方法删除id为tableId的数据表。
```javascript
        table.deleteTable("abcc2a5f-17cd-4a99-911f-1213c8c44dec", {
            "200": function (XMLHttpRequest) {
                console.log("数据表删除成功");
            }
        });
```

参数列表：
- tableId:数据表ID。
- callbackJSON:回调函数JSON，具体参考回调函数一章。

------------


##DB.Sync （数据同步）
###send:服务器交互通用方法
args:
* sendType：数据请求类型：POST PUT DELETE GET
* sendUrl：数据请求地址，请求地址需要进行拼接，拼接方法参考Restful
* sendData：待发送数据 ：JSON
* callbackJson：回调函数JSON，DataEngin.js自带默认回调函数，用户可以通过传入回调函数JSON进行覆盖操作。格式如下：
```javascript
  a.send('post','/className',{'title':'Test'},{
     '404':function(){
        //do someThing
      },
     '201':function(){
       //do someThing
     }
  })
```
###Post、Get、Delete、Put、Options：创建、获取、删除、更新、操作
Post、Get、Delete、Put为特有的四种方式，封装了send方法，提供便捷的与数据库交互方法。
args:
* sendType：数据请求类型：POST PUT DELETE GET
* sendUrl：数据请求地址，请求地址需要进行拼接，拼接方法参考Restful
* sendData：待发送数据 ：JSON
* callbackJson：回调函数JSON，DataEngin.js自带默认回调函数，用户可以通过传入回调函数JSON进行覆盖操作。格式如下：
```javascript
  a.post('/className',{'title':'Test'},{
     '404':function(){
        //do someThing
      },
     '201':function(){
       //do someThing
     }
  })
```

##DB.OptionBase （数据操作）
###addField(field)：增加字段
为一个DBObject增加一个字段,字段格式为JSON。field内容由调用者设置。
```javascript
         table.addField({
             "label": "",
             "field_type": 0,
             "required": true,
             "unique": false,
             "is_random": true,
             "default": null,
             "min": 1,
             "max": 10
         });
```
参数列表：
- field:字段JSON，包含字段信息

###addTitle(titleName):增加表名
为调用该方法的DBTable增加一个title属性，表示当前数据表的表名。格式为title=titleName。
```javascript
table.addTitle("数据表title");
```
参数列表：
- titleName:数据表表名

###addStartDate(startDate):开始时间
为调用该方法的DBTable增加一个start属性，表示当前数据表的开始时间。格式为start=startDate。
```javascript
table.addStartDate("2016-04-21");
```
参数列表：
- startDate:数据表开始时间

###addEndDate(endDate):结束时间
为调用该方法的DBTable增加一个end属性，表示当前数据表的结束时间。格式为end=endDate。
```javascript
table.addEndDate("2016-04-21");
```
参数列表：
- endDate:数据表结束时间

###addRule(rule):数据表规则
为调用该方法的DBTable增加一个rule属性，表示当前数据表的规则。格式为rule=rule。
```javascript
table.addRule(1);
```
参数列表：
- rule:数据表规则类型

###addOpt(key,value):自定义属性
为调用该方法的DBTable增加一个自定义的属性。格式为key=value。
```javascript
table.addOpt("cid","222");
```
参数列表：
- key:自定义属性的键。
- value:自定义属性的值。

###getField：查找字段
```javascript
        /**
         * 根据条件查找字段
         * @param key :查找的字段对象的key
         * @param value :找到的字段对象的Value
         * @returns {*}:DB.DBObject
         */
         a.getField('cid','1');
```
###getFields：全部查找
```javascript
        /**
         * 查找全部Object的字段
         * @returns {Array} 字段数组
         */
         var arrs=a.getFields();
```
###removeField：删除字段(待开发)
```javascript
        /**
         * 删除Object的指定字段
         * @param key 查找的字段对象的key
         * @param value  找到的字段对象的Value
         */
         a.removeField('cid','1');
```
###removeAll：删除全部字段
```javascript
         /**
         * 删除Object的所有字段
         */
         a.removeAll();
```

------------


##DB.DBQuery (数据查询对象)
###addAggregate(DBAggregate): 增加统计对象
通过new DB.DBAggregate()创建一个统计对象，并为该统计对象设置属性，将该统计对象添加至DBQuery对象中。DBQuery以数组的形式接收统计子对象。
```javascript
 var query=new DB.DBQuery();//创建一个Query对象
 var aggregate = new DB.DBAggregate("group_id");//创建一个统计对象
 aggregate.sum('age').max('score').setRange(10, 20);//为统计子句设定属性：按照age字段进行求和，并获取score的字段值，查找范围为10~20及大于20的记录
 query.addAggregate(aggregate);//将统计子对象加入查询对象中
```
参数列表：
- DBAggregate：DBAggregate对象，具体DBAggregate属性设置请参考DBAggregate统计对象章节。

###addLimit(DBLimit): 增加查询对象
通过new DB.DBLimit()创建一个查询子对象，并为该统计对象设置属性，将该查询对象添加至DBQuery对象中。DBQuery以数组的形式接收统计子对象。
```javascript
 var query=new DB.DBQuery();//创建一个Query对象
 var limit =new DB.DBLimit();//创建一个查询对象
 limit.equalTo("title", '张三');//为查询对象设定属性：查找title=“张三”的记录
 query.addLimit(limit);//将查询子对象加入查询对象中
```
参数列表：
- DBLimit：DBLimit对象，具体DBLimit属性设置请参考DBLimit查询对象章节。

###addFilter(DBFilter):增加过滤对象
通过new DB.DBFilter()创建一个查询子对象，并为该统计对象设置属性，将该查询对象添加至DBQuery对象中。DBQuery以数组的形式接收统计子对象。
```javascript
 var query=new DB.DBQuery();//创建一个Query对象
 var filter =new DB.DBFilter();//创建一个查询对象
 filter.lessThanOrEqualTo('age', '20');//为过滤对象设定属性：过滤age字段小于等于20的记录
 query.addFilter(filter);//将过滤子对象加入查询对象中
```
参数列表：
- DBFilter：DBFilter对象，具体DBFilter属性设置请参考DBFilter过滤对象章节。

###addSort(column_key，sort_way)：增加排序字段
为DBQuery对象增加一个排序字段，数据会根据设置的排序字段依次进行过滤。

```javascript
 var query=new DB.DBQuery();//创建一个Query对象
 query.addSort("title","DESC").addSort("age","ASC");
```
参数列表：
- column_key:字段名称
- sort_way:排序方法，可选值：DESC、ASC

###addConfig(config)：增加查询配置
为DBQuery对象增加一个配置字段，数据会根据设置的配置字段进行查询，例如页码信息，每页显示最大页码数，该方法接受两个参数：
- config: DBConfig对象

```javascript
 var query=new DB.DBQuery();//创建一个Query对象
 query.addSort("title","DESC").addSort("age","ASC");
```
参数列表：
- DBConfig：DBConfig对象，具体DBConfig属性设置请参考DBConfig配置对象章节。

###Query(sendUrl, callbackJSON):执行查询
查询对象与服务器交互的唯一方法，当设置完所有的DBQuery属性（）之后，执行DBQuery.Query(args)，即可将查询请求发送到服务器中。
```javascript
var query=new DB.DBQuery();//创建一个Query对象
//...设置query属性
query.Query("http://data.21epub.com/tables/5e055c31-bbf1-40fa-8c43-26dbdcf535ed/", {
            "200": function (XMLHttpRequest) {
                console.log(eval('(' + XMLHttpRequest.responseText + ')').data);
            }
        });
```
参数列表：
- sendUrl：需要发送到服务器的URL地址。例：[http://data.21epub.com/tables/table_Id/).
- callbackJSON:服务器响应之后的回调函数，具体参考回调函数一章

------------

##DB.DBConfig(查询配置)
###创建对象
DBConfig用来配置必需的数据查询配置信息，例如页码信息、每页显示记录数信息等。DBConfig是DBQuery必需属性。初始化时需要传入一个参数，即每页显示记录数
```javascript
var config=new DB.DBConfig(40);//参数为每页显示的记录数
```
参数列表：
- recordCount:每页显示的记录数

###setPage(page_num)：设定查询页码
设定需要查询的页码，SDK会在后台计算当前页码中第一条记录的index值，如果用户不设置该属性，则会保留默认页码1，即服务器从第0条记录开始查询。
```javascript
config.setPage(10);//查询第10页记录
```
参数列表：
- page_num：需要查询的页码

###nextPage()：下一页
跳转到当前页的下一页。
```javascript
config.nextPage();
```
###prevPage()：上一页
跳转到当前页的上一页
```javascript
config.prevPage();
```
###setCount(recordCount)：设置每页记录数
重新设置每页的记录数，该设置会覆盖初始化时配置的记录数。
```javascript
config.setCount(20);//每页显示20个
```
参数列表：
- recordCount：每页显示记录数

###getPage：获取页码信息
获取当前设置的页码信息。
```javascript
config.getPage();//return 20
```

###getCount：获取每页记录数
获取当前设置的每页记录数。
```javascript
config.getCount();//return 25
```

------------

##DB.DBAggregate（数据统计对象）
###创建对象：
一个关键词查询后可能会找到数以万计的文档，用户不太可能浏览所有的文档来获取自己需要的信息，有些情况下用户感兴趣的可能是一些统计的信息。
创建一个数据统计对象：
```javascript
var aggregate=new DB.DBAggregate("title");//创建对象时需要传入group_id
```
参数 group_id：必选参数。field为要进行统计的字段名，必须勾选可过滤，目前支持int类及string类型的字段做统计。

DBAggregate为一个Object对象，用户通过不同方法设置如下属性：
- agg_fun：必选参数。func可以为count()、sum(id)、max(id)、min(id)四种系统函数，含义分别为：文档个数、对id字段求和、取id字段最大值、取id字段最小值；支持同时进行多个函数的统计，中间用英文井号（#）分隔；sum、max、min的内容支持基本的算术运算；
- range：表示分段统计，可用于分布统计，支持多个range参数。表示number1~number2及大于number2的区间情况。不支持string类型的字段分布统计。
- agg_filter：非必须参数，表示仅统计满足特定条件的文档；
- agg_sampler_threshold：非必须参数，抽样统计的阈值。表示该值之前的文档会依次统计，该值之后的文档会进行抽样统计；
- agg_sampler_step：非必须参数，抽样统计的步长。表示从agg_sampler_threshold后的文档将间隔agg_sampler_step个文档统计一次。对于sum和count类型的统计会把阈值后的抽样统计结果最后乘以步长进行估算，估算的结果再加上阈值前的统计结果就是最后的统计结果。
- max_group：最大返回组数，默认为1000。

###sum(id):求和函数
通过sum(id)方法，可以为字段名为id的数据表增加一个求和的统计数据。SDK会判断当前的DBAggregate是否已经存在agg_fun，若不存在，则创建agg_fun对象，若存在，则在当前agg_fun的value值之后追加当前请求，格式为fun1#fun2
```javascript
var aggregate=new DB.DBAggregate("title");//创建对象时需要传入group_id
aggregate.sum("title");
```
参数列表:
- id：需要求和的字段名

###max(id):最大值函数
通过max(id)方法，可以为字段名为id的数据表增加一个求最大值的统计数据。SDK会判断当前的DBAggregate是否已经存在agg_fun，若不存在，则创建agg_fun对象，若存在，则在当前agg_fun的value值之后追加当前请求，格式为fun1#fun2
```javascript
var aggregate=new DB.DBAggregate("title");//创建对象时需要传入group_id
aggregate.max("title");
```
参数列表:
- id：需要求最大值的字段名

###min(id):最小值函数
通过min(id)方法，可以为字段名为id的数据表增加一个求最大值的统计数据。SDK会判断当前的DBAggregate是否已经存在agg_fun，若不存在，则创建agg_fun对象，若存在，则在当前agg_fun的value值之后追加当前请求，格式为fun1#fun2
```javascript
var aggregate=new DB.DBAggregate("title");//创建对象时需要传入group_id
aggregate.min("title");
```
参数列表:
- id：需要求最小值的字段名

###count:总数函数
通过count()方法，可以数据表增加一个求总数的统计数据。SDK会判断当前的DBAggregate是否已经存在agg_fun，若不存在，则创建agg_fun对象，若存在，则在当前agg_fun的value值之后追加当前请求，格式为fun1#fun2
```javascript
var aggregate=new DB.DBAggregate("title");//创建对象时需要传入group_id
aggregate.count();
```

###setRange(num1,num2):设定统计区间
通过setRange()方法可以设定统计对象生效的区间范围，通过传入两个参数表示范围为num1~num2，以及大于num2的记录。该方法会写入DBAggregate的agg_filter属性。
```javascript
var aggregate=new DB.DBAggregate("title");//创建对象时需要传入group_id
aggregate.setRange(20,100);//查找第20~100以及大于第100条的记录
```
参数列表：
- num1:区间起始记录
- num2:区间结束记录

###setFilter(filter):设定统计过滤条件
在进行数据统计时，可以通过setFilter方法对统计数据进行过滤操作，setFilter需要传入一个DBFilter对象。该方法会写入DBAggregate的agg_filter中。
```javascript
var aggregate=new DB.DBAggregate("title");//创建对象时需要传入group_id
 var filter =new DB.DBFilter();//创建一个查询对象
 filter.lessThanOrEqualTo('age', '20');//为过滤对象设定属性：过滤age字段小于等于20的记录
aggregate.setFilter(filter);//为统计对象设置filter属性
```
参数列表：
-filter：DBFilter对象

###setSamplerThreshold(num, step):统计阈值
设置一个统计的阈值，当在num值之前的文档会依次统计，num值之后的文档会进行抽样统计，抽样统计的步长为step值。该方法的num参数会写入DBAggregate的agg_sampler_threshold中，该方法的step参数会写入DBAggregate的agg_sampler_step 中。
```javascript
var aggregate=new DB.DBAggregate("title");//创建对象时需要传入group_id
aggregate.setSamplerThreshold(50,5);//50条记录之前依次统计，50条记录之后抽样统计，步长为5
```
参数列表：
- num：抽样统计的阈值
- step：抽样统计步长

###setMaxGroup(group_number)：最大返回组数
设置当前分组统计数据按照group_id分组的最大返回统计组数。该方法会写入DBAggregate的max_group中。
```javascript
var aggregate=new DB.DBAggregate("title");//创建对象时需要传入group_id
aggregate.setMaxGroup(50);//每次返回的最大组数为50组
```
参数列表：
- group_number：最大分组数


------------

##DB.DBFilter:过滤对象
过滤功能支持用户根据查询条件，筛选出用户感兴趣的文档。会在通过DBQuery对象查找到的文档进行进一步的过滤，以返回最终所需结果。
- 过滤条件支持>、<、=、<=、>=、!=等常见条件运算符；以及+、-、*、/、&、^、| 等算术运算符；（部分未实现）
- 过滤条件可以配置多个，通过AND、OR及()的逻辑运算关系（必须大写！）进行连接。

###创建对象
通过new DB.DBFilter()创建一个过滤对象，创建的过滤对象只有通过DBQuery的addFilter方法添加到DBQuery对象中才会与服务器端交互。
```javascript
var filter=new DB.DBFilter();
```
###equalTo(key,value):等于运算
该方法为DBFilterr对象增加一个等于的过滤条件，格式为key="value"，即在数据表中查找字段名为key的，值为value的记录，并将记录返回。
```javascript
var filter=new DB.DBFilter();
filter.equalTo("title","张三");//查找字段为title，且值为张三的记录
```
参数列表：
- key:需要查找的字段名
- value:需要查找的字段值

###notEqualTo(key,value):不等于运算
该方法为DBFilterr对象增加一个不等于的过滤条件，格式为key="value"，即在数据表中查找字段名为key的，值不为value的记录，并将记录返回。
```javascript
var filter=new DB.DBFilter();
filter.notEqualTo("title","张三");//查找字段为title，且值为张三的记录
```
参数列表：
- key:需要查找的字段名
- value:需要查找的字段值

###lessThan(key,value):小于运算
该方法为DBFilterr对象增加一个小于的过滤条件，格式为key="value"，即在数据表中查找字段名为key的，值小于value的记录，并将记录返回，只对可以排序的类型有效。
```javascript
var filter=new DB.DBFilter();
filter.lessThan("age","30");//查找字段为age，且值小于30的记录
```
参数列表：
- key:需要查找的字段名
- value:需要查找的字段值

###lessThanOrEqualTo(key,value):小于等于运算
该方法为DBFilterr对象增加一个小于等于的过滤条件，格式为key="value"，即在数据表中查找字段名为key的，值小于等于value的记录，并将记录返回，只对可以排序的类型有效。
```javascript
var filter=new DB.DBFilter();
filter.lessThanOrEqualTo("age","30");//查找字段为age，且值小于等于30的记录
```
参数列表：
- key:需要查找的字段名
- value:需要查找的字段值

###greaterThan(key,value):大于运算
该方法为DBFilterr对象增加一个大于的过滤条件，格式为key="value"，即在数据表中查找字段名为key的，值大于value的记录，并将记录返回，只对可以排序的类型有效。
```javascript
var filter=new DB.DBFilter();
filter.greaterThan("age","30");//查找字段为age，且值大于30的记录
```
参数列表：
- key:需要查找的字段名
- value:需要查找的字段值

###greaterThanOrEqualTo(key,value):大于等于运算
该方法为DBFilterr对象增加一个大于等于的过滤条件，格式为key="value"，即在数据表中查找字段名为key的，值大于等于value的记录，并将记录返回，只对可以排序的类型有效。
```javascript
var filter=new DB.DBFilter();
filter.greaterThanOrEqualTo("age","30");//查找字段为age，且值大于等于30的记录
```
参数列表：
- key:需要查找的字段名
- value:需要查找的字段值

###and(filter):过滤与操作
将两个过滤对象DBFilter通过AND连接符进行连接，第一个过滤对象为调用and方法的DBFilter方法，第二个过滤对象为参数filter传入的对象。
```javascript
var filter1=new DB.DBFilter();
filter.greaterThanOrEqualTo("age","30");//查找字段为age，且值大于等于30的记录
var filter2=new DB.DBFilter();
filter2.lessThanOrEqualTo("age","30");//查找字段为age，且值小于等于30的记录
filter1.and(filter2);//将filter1与filter2做AND运算
```
参数列表：
- filter:需要进行AND操作的DBFilter对象

###or(filter):过滤或操作
将两个过滤对象DBFilter通过OR连接符进行连接，第一个过滤对象为调用and方法的DBFilter方法，第二个过滤对象为参数filter传入的对象。
```javascript
var filter1=new DB.DBFilter();
filter.greaterThanOrEqualTo("age","30");//查找字段为age，且值大于等于30的记录
var filter2=new DB.DBFilter();
filter2.lessThanOrEqualTo("age","30");//查找字段为age，且值小于等于30的记录
filter1.or(filter2);//将filter1与filter2做AND运算
```
参数列表：
- filter:需要进行OR操作的DBFilter对象

###and_not(filter):过滤与非操作
将两个过滤对象DBFilter通过ANDNOT连接符进行连接，第一个过滤对象为调用and方法的DBFilter方法，第二个过滤对象为参数filter传入的对象。
```javascript
var filter1=new DB.DBFilter();
filter.greaterThanOrEqualTo("age","30");//查找字段为age，且值大于等于30的记录
var filter2=new DB.DBFilter();
filter2.lessThanOrEqualTo("age","30");//查找字段为age，且值小于等于30的记录
filter1.and_not(filter2);//将filter1与filter2做AND运算
```
参数列表：
- filter:需要进行ANDNOT操作的DBFilter对象

------------
##DB.DBLimit（暂不开放）
###创建对象：
Limit对象是DBQuery不可缺少的一部分，它表示在哪个索引字段下查询什么内容，并且可以指定多个查询条件及其之间的关系。
###equalTo(key, value):设置字段限制条件
###and：与操作
###or：或操作
###and_not：与非操作
###rank：字段优先级




------------


##DB.Utils （工具包）
###each：数组遍历
```javascript
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
         Utils.each(list,function(item){
          console.log(item);
         })
```

###setOpt:设置属性
```javascript
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
        Utils.setOpt(source , 'name', '张三' );
```
###getOpt：获取属性
```javascript
         /**
         * 该方法是提供给插件里面使用，通过JSON的key获取value值
         * @param source 源对象
         * @param key JSON可接受的选项名称
         * @returns {*} key所对应的value值
         */
         Utils.setOpt(source , 'name');
```
###contains：判断数组是否包含
```javascript
        /**
         * 判断某个元素是否在给定的源数组中
         * @param arr :源数组
         * @param obj :查找的元素
         * @returns {boolean} true:存在,false:不存在
         */
         Utils.contains(['1','2','3'],'1');
```
###inherits:模拟继承
```javascript
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
        Utils.inherits(SubClass,SuperClass);
```
###extend：扩展对象
```javascript
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
        Utils.extend( target, source, true );
```
###makeInstance：以给定对象作为原型创建一个新对象
```javascript
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
         var newObject = Utils.makeInstance( protoObject );
```
### 类型判断：String、Array、Function、Number、RegExp、Object、Date
```javascript
    Utils.isArray(object);
```

------------


##全局变量 （默认配置）
###默认回调函数（根据状态码）
```javascript
var defaultCode = DB.defaultCode = {
        "200": function (XMLHttpRequest) {
            console.log("服务器执行成功");
            console.log(XMLHttpRequest);
        },
        "201": function (XMLHttpRequest) {
            console.log("服务器已创建");
            console.log(XMLHttpRequest);
        },
        "400": function (XMLHttpRequest) {
            console.log("错误的请求");
            console.log(XMLHttpRequest);
        },
        "401": function (XMLHttpRequest) {
            console.log("未授权访问");
            console.log(XMLHttpRequest);
        },
        "403": function (XMLHttpRequest) {
            console.log("禁止访问");
            console.log(XMLHttpRequest);
        },
        "404": function (XMLHttpRequest) {
            console.log("页面没找到");
            console.log(XMLHttpRequest);
        },
        "405": function (XMLHttpRequest) {
            console.log("405方法未被允许");
            console.log(XMLHttpRequest);
        }
    };
```

###保留关键字
```javascript
     /**
     * 保留关键字,用户在传入参数的时候会进行关键字验证,如果参数是关键字,则中止流程(return)
     * @type {string[]}
     */
    var banWord = DB.banWord = ["acl", "error", "pendingKeys",
        "ACL", "fetchWhenSave", "running", "className", "id", "updatedAt",
        "code", "isDataReady", "uuid", "createdAt", "keyValues", "description", "objectId"];
```

###  数据格式说明：

新建或更新数据表的结构：
```json
{
  "title": "抽奖2",
  "start": "2016-05-10 13:32:21",
  "end": "2016-05-20 13:32:21",
  "rules": 1,
  "fields": [
    {
      "label": "",
      "field_type": 0,
      "required": true,
      "unique": false,
      "is_random": true,
      "default": null,
      "min": 1,
      "max": 10,
      "cid": "i1, s1, f1, d1"
    }
  ]
}
```


------------

##回调函数
系统自带了默认的回调函数，见全局变量一章，由于系统自带的回调函数功能简单，用户可以自行覆盖默认回调函数，覆盖方法为传入callbackJSON参数，其中key为服务器返回的状态码（参考Restful）。例如：
```javascript
var table = new DB.DBTable("user");
var callbackJSON={
	"200":function(){
		console.log("这是覆盖之后的200");
	},
	"201":function(){
		console.log("这是覆盖之后的201");
	},
	"202":function(){
		console.log("这是覆盖之后的202");
	}
}
table.saveTable(true,callbackJSON);
```



## 服务域名
 * http://data.21epub.com/
 
### http://data.21epub.com/tables/
* GET 查看用户创建的数据表
  * request params:
    * page INTEGER default:1
    * size INTEGER default:20
    * id INTEGER 应用id 
  * response

    ```json
{
  "msg": "success",
  "code": 200,
  "data": {
    "numpages": 1,
    "sum": 9,
    "page": 1,
    "results": [
      {
        "start": "2016-05-17 11:46:27",
        "end": "2016-05-17 11:46:27",
        "description": "",
        "title": "抽奖2",
        "url": "http://data.21epub.com/tables/2c57fa45-6e10-46b4-9a5d-d67c6ee0e7d9/",
        "fields": [
          {
            "field_type": 0,
            "unique": false,
            "min": 0,
            "default": "",
            "max": 100,
            "required": true,
            "label": "抽奖号码1",
            "cid": "i1, s1, f1, d1",
            "is_random": true
          }
        ],
        "modifyTime": "2016-05-17 11:46:27",
        "id": "2c57fa45-6e10-46b4-9a5d-d67c6ee0e7d9",
        "rule": 0,
        "created": "2016-05-17 11:46:27"
      }
    ]
  },
  "_user_id": 2
}
    ````
* POST
  * request raw body

    ```json
{
  "title": "联系方式发发",
  "start": "2016-05-17 11:46:27",
  "end": "2016-05-17 11:46:27",
  "rules": "1",
  "fields": [
    {
      "label": "放到发疯",
      "field_type": "0",
      "required": false,
      "unique": false,
      "is_random": false,
      "default": "",
      "min": "",
      "max": ""
    }
  ]
}
```
  * response
    * http status 201
    * HTTP HEAD Location: http://data.21epub.com/tables/xxxxxxxxx/
    * content: 

      ```json
    {
      "id": "xxxxxxxx",
      "created": "2015-05-13 08:34:23"
    }
      ```

* DELETE (未实现，批量删除数据表)

### http://data.21epub.com/tables/table_uuid/

* GET 显示html表单用于新增数据
* OPTIONS 获取数据表字段定义
* PUT  修改数据表信息 title rule start end, fields
* DELETE 删除数据表

### http://data.21epub.com/tables/table_uuid/info/

* GET 获取数据表添加规则

### http://data.21epub.com/tables/table_uuid/objects/

* GET 获取数据list
  * params: data

    ```json
{
  "aggregate": [
    {
      "group_key": "tdd",
      "agg_fun": "sum(dsdc)#max(a)",
      "range": "10~20",
      "agg_filter": "aa",
      "agg_sampler_threshold": 1000,
      "agg_sampler_step": 20,
      "max_group": 30
    },
    {
      "group_key": "tdd大多数",
      "agg_fun": "sum(dsd12c)#min(b)",
      "range": "130~240",
      "agg_filter": "123",
      "agg_sampler_threshold": 1000,
      "agg_sampler_step": 20,
      "max_group": 30
    }
  ],
  "q": [
    {
      "statement": {
        "opt": "RANK",
        "values": [
          {
            "statement": {
              "opt": "OR",
              "values": [
                {
                  "key": "title",
                  "value": "张三"
                },
                {
                  "key": "title",
                  "value": "王五"
                }
              ]
            }
          },
          {
            "key": "title",
            "value": "王五"
          }
        ]
      }
    }
  ],
  "filter": [
    {
      "statement": {
        "opt": "OR",
        "values": [
          {
            "statement": {
              "opt": "OR",
              "values": [
                {
                  "statement": {
                    "opt": "AND",
                    "values": [
                      {
                        "key": "title",
                        "option": "=",
                        "value": "value"
                      },
                      {
                        "key": "title2",
                        "option": "<=",
                        "value": "value"
                      }
                    ]
                  }
                },
                {
                  "key": "title2",
                  "option": "<=",
                  "value": "2"
                }
              ]
            }
          },
          {
            "key": "title2",
            "option": "<=",
            "value": "2"
          }
        ]
      }
    }
  ],
  "config": {
    "hit": 20,
    "start": 100
  },
  "execSQL": "select * from user u where u.id=1",
  "sort": [
    "+aaa",
    "-bdd"
  ]
}
```
* POST  新增数据  
* DELEte  批量删除数据
  * params：  ids LIST

### http://data.21epub.com/tables/table_uuid/objects/object_id/

* GET 获取object_id对应的数据
* PUT 修改数据
* DELETE 删数据


