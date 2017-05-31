万能工资条移动端页面

## 基础依赖

- Zepto
- doT.js


## 目录结构

- app：源代码
  - common：公共设施
    - sytles：样式表
    - scripts：JS
  - your_app：一个页面一个文件夹
    - index.html：入口
    - app.js：JS入口
- dest：编译代码后存放位置，源码中不存在
- output：打包文件存放位置，源码中不存在

## 项目目录
#### 1.0版本
1. payrolls-detail
2. payrolls-list
3. jurisdiction-ratify 权限认可 
4. info-details
5. homepage
6. app_fund_details

#### 2.0新增页面
1. my-welfare 我的福利
2. my-welfare-info 福利详情
3. my-welfare-history 历史福利


## doT.js 如何使用

所有以`.tpl.html`都被是别为模板，可以在JS中直接require进来。

```javascript
// 引入模板引擎
var dot = require('dot/doT');
// 获取模板
var myTemplate = require('my_template.tpl.html');
// 编译模板
var compiled = dot.template(myTemplate);

var yourData = { /* Your Data here */ };
// 渲染结果
var result = compiled(yourData);
```

doT.js 模板引擎支持的基本语法

```php
<!-- 基本的数据输出 -->
<div>Hi {{=it.name}}!</div>
<div>{{=it.age || ''}}</div>
  
<!-- 带转义的输出 -->
Visit {{!it.uri}}
  
<!-- 数组循环 -->
{{~it.array :value:index}}
<div>{{=value}}!</div>
{{~}} 

<!-- 条件控制 -->
{{? it.name }}
<div>Oh, I love your name, {{=it.name}}!</div>
{{?? it.age === 0}}
<div>Guess nobody named you yet!</div>
{{??}}
You are {{=it.age}} and still don't have a name?
{{?}}
```

具体文档可以看[这里](http://olado.github.io/doT/index.html)

## 代理服务器的使用和配置

Browser-Sync集成了http-proxy-middleware，可以将匹配的url请求转发给其他http服务器。
此功能可用于本地调试时访问测试服务器或线上服务器的数据服务。
配置文件为`proxy.config.js`。

urlPattern: 本地http服务的url匹配规则，匹配上的url会被转发给target。
target: 转发的目标http服务

**urlPattern常规使用**

* `'/'` - 匹配所有路径，所有请求都将被转发
* `'/api'` - 匹配以`/api`开始的路径
* `['/api', '/ajax', '/someotherpath']` - 匹配多个路径

**通配符匹配**

* `'**'` - 匹配所有路径，所有请求都将被转发.
* `'**/*.html'` - 匹配以所有`.html`结尾的路径
* `'/*.html'` - 匹配根路径下的以`.html`结尾的路径
* `'/api/**/*.html'` - 匹配以`/api`开始并以`.html`结尾的路径
* `['/api/**', '/ajax/**']` - 匹配多个路径
* `['/api/**', '!**/bad.json']` - 去除特定路径

**自定义**

```javascript
/**
 * @return {Boolean}
 */
var filter = function (pathname, req) {
    return (pathname.match('^/api') && req.method === 'GET');
};

urlPattern = filter;
```

具体文档可以看[这里](https://github.com/chimurai/http-proxy-middleware)

## 提供的命令

- npm run start：启动调试服务器
- npm run build：开发用编译
- npm run release：发布用编译
- npm run clean：清理编译结果
- npm run test：保留用于单元测试
