
# mini-scrolling-loading

微信小程序滚动加载拓展组件，对官方方案进行了以下优化：

* 减少重复去写分页加载函数和分页逻辑
* 支持长列表虚拟渲染
* 优化删除子项无刷新交互

## 使用

1. 安装组件

```javascript
npm i mini-scrolling-loading --save
```

2. 在页面的 json 配置文件中添加 mini-scrolling-loading 自定义组件的配置

```javascript
{
  "usingComponents": {
    "mini-scrolling-loading": "mini-scrolling-loading/index",
    "scrolling-item": "/components/scroll-item/index"
  }
}
```

scrolling-item(组建名可自定义)组建为开发者自定义的列表单个item样式组建，mini-scrolling-loading采用抽象节点方式进行渲染，例如：

#### 组建.wxml

```javascript
<view class="scroll-view-item" catchtap="delItem" mark:id="{{item.id}}">{{item.title}}</view>
```

#### 组建.ts

```javascript
Component({
    properties: {
        item: Object  // 变量名需使用item
    },
    methods: {
        delItem(e: { mark: { id: number}}) {
            const {id} = e.mark
            this.triggerEvent('delItem', {id}) // 如果有使用删除，在删除成功后，需派发delItem事件，传入删除的主键id即可，组建会无刷新更新列表。
        }
    }
})
```

3.WXML 文件中引用 mini-scrolling-loading

```javascript
<mini-scrolling-loading generic:sitem="scrolling-item" perpage="{{20}}" idKey="id" api="{{getData}}"></mini-scrolling-loading>
```

#### mini-scrolling-loading属性介绍

| 字段名 | 类型 | 必填 | 默认值 | 描述 |
| :---: | :---:| :---:| :---: | :---: |
| api | Function | 是 | - | API接口请求Promise函数 |
| page | Number | 否 | 1 | 分页|
| perpage | Number | 否 | 10 | 页码|
| perpageKey | String | 否 | perpage | 分页参数字段，例如pageSize |
| idKey | String | 是 | id | 能代表唯一标识的字段名 |
| resKey | String | 否 | data | 接口返回的data路径 |
| totalKey | String| 否 | total| 数据量总数 |
| query | Object | 否 | {} | 查询额外字段参数 |
| height | String | 是 | 100vh | 可视容器高度 |
| itemHeight | number | 是 | 40 | 单个Item高度，单位px|
| enUpper | Boolean | 否 | false | 开启下拉刷新 |
| success | Function | 否 | { totalCount: number, data: []} | api 请求成功返回 |
| error | Function | 否 | - | api请求失败回调 |
| delSuccess | Function | 否 | - | 删除成功回调 |
| sprops | Object | 否 | {} | 抽象节点的props集合 |
| sEvent | Function | 否 | - | 抽象节点派发事件委托 |

## Demo

用微信开发者工具导入以下代码片段：

```javascript
https://developers.weixin.qq.com/s/r4BBrfmF7NIF
```

## 虚拟列表原理图示

![虚拟列表](./src/assets/virtual.png)

Demo

![demo](./src/assets/virtual-demo.gif)

## 分页删除数据无刷新图示

![删除元素](./src/assets/del-item.png)

## 外部样式

| 类名 | 描述 |
| :--: | :--: |
| custom-class | 根结点样式 |

## slot

| name | 描述 |
| :--: | :--: |
| loading | 加载中 |
| loading-finish | 加载结束 |
| empty | 暂无数据占位 |

## 方法

通过 selectComponent 可以获取到 mini-scrolling-loading 实例并调用实例方法。
| 方法名 | 参数 | 返回值 | 介绍 |
|:---:| :---: | :---: | :---: |
| refreshData | - | - | 刷新列表 |
| getResData| - | object[]| 获取接口返回值 |
| getResTotal | - | number | 获取总数 |

## 二次开发

1. clone代码

```javascript
git clone https://github.com/WGinit/mini-scrolling-loading.git
```

2. 安装依赖

```javascript
npm i or yarn
```

3. 开发或监听模式

```javascript
yarn watch
```

4. 打包

```javascript
yarn build
```

## 备注

针对抽象子组件如果设计业务交互逻辑较为复杂，因微信抽象节点功能限制，不建议使用此组件去实现。
