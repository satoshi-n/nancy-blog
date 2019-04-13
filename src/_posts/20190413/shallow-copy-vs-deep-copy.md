---
title: シャローコピー(shallow copy)とディープコピー(deep copy)の違い
description: 
date: 2019-04-13
categories:
  - JavaScript
permalink: /shallow-copy-vs-deep-copy
---
# {{ $page.title }}

<PostMeta/>

変更前後の値を比較する際に、ディープコピーが使われる。  
例えば、商品の管理画面を作成しているとする。  
商品名や説明、金額を変更できるが、管理画面を使っている人は変更前はどんな値だったか確認しながら変更したいと思う。変更前の値と変更後の値を比較するには、変更前の値をどこかに保持しておかねばならない。そこでディープコピーが使われる。
ここでシャローコピーを使うと、新たに入力された値が、コピーしておいた値も変更してしまうことになる。  
この記事では`Object.assign`でのシャローコピーと、`JSON.parse(JSON.stringify(obj))`でのディープコピー、lodashの`cloneDeep`でのディープコピーを比較する。

[[toc]]

## シャローコピーとディープコピーの違い
シャローコピー(浅いコピー)はプリミティブ値(文字列、数値、真偽値、null、undefined、Symbol)をコピーするが、それ以外のオブジェクトは参照をコピーする。参照がコピーされるということは、コピー元とコピー先でオブジェクトが共有されるということである。  
一方、ディープコピー(深いコピー)はプリミティブ値だけでなく、オブジェクトも値としてコピーする。したがって、コピー元とコピー先のオブジェクトは別物である。

## コピー元のオブジェクト
次のようなオブジェクトを用意して、シャローコピーした時の違いを確認する。
オブジェクトには文字列、数値、真偽値、null、undefined、シンボルのようなプリミティブ型と、Dateオブジェクト、Functionオブジェクト、Arrayオブジェクト、入れ子になったオブジェクトを用意しておく。

``` js
const obj = {
  str: "テキスト",
  num: 3,
  bl: true,
  nl: null,
  ud: undefined,
  sy: Symbol('heart'),
  date: new Date('2019-04-11T15:54:30+09:00'),
  fn: function () { console.info('obj function') },
  ar: [1, 2, 3],
  ob: {
    str: "別のテキスト",
    num: 10,
    bl: false,
    nl: null,
    ud: undefined,
    sy: Symbol('spade'),
    date: new Date('2019-04-12T00:01:23+09:00'),
    fn: function () { console.info('another function') },
    ar: [5, 6, 7],
  },
};
```

## Object.assignでシャローコピーする
ECMAScript 2015によりオブジェクトをコピーする`Object.assign`という方法が提供された。これはシャローコピーによりオブジェクトをコピーするため、コピー元の値のみ変更しているつもりでも、コピー先の値も変更されてしまうことがある。

`Object.assign()`メソッドの使い方は第一引数にコピー先オブジェクト、第二引数にコピー元のオブジェクトを指定し、戻り値としてコピー先オブジェクトを返す。

以下のように書くことで`copiedObj`にコピーされたオブジェクトが格納される。
``` js
const copiedObj = Object.assign({}, obj);
```

厳密等価(===)で比較すると`false`となるため、一見コピーされているように見える。
``` js
console.info(obj === copiedObj);// false
```

しかし、Dateオブジェクト、Arrayオブジェクト、そして入れ子になったオブジェクトのプロパティを変更すると、コピー元の変更が、予期せずコピー先にも反映されてしまう。
``` js
obj.date.setMonth(obj.date.getMonth() + 1);
console.info(obj.date);       // 2019-05-11T06:54:30.000Z
console.info(copiedObj.date); // 2019-05-11T06:54:30.000Z

obj.ar.push(8);
console.info(obj.ar);         // [ 1, 2, 3, 8 ]
console.info(copiedObj.ar);   // [ 1, 2, 3, 8 ]

obj.ob.str = '変更後の別のテキスト';
console.info(obj.ob.str);       // 変更後の別のテキスト
console.info(copiedObj.ob.str); // 変更後の別のテキスト
```

## JSON.parse(JSON.stringify(obj))によるもっとも簡易なディープコピー
このような予期しないコピーを防ぐのがディープコピーといわれる方法だ。  
ディープコピーの方法はECMAScriptに定義されていないため、独自に実装するか、ライブラリを使うことになる。独自に実装するなかでもっとも簡易な方法として、オブジェクトをJSON文字列に変換する`JSON.stringify`と、JSON文字列をオブジェクトに変換する`JSON.parse`を組み合わせた方法がある。

コピー元のオブジェクトを`JSON.stringify`メソッドの引数に指定して、`JSON.parse`によりJavaScriptのオブジェクトに戻しコピーしたオブジェクトを得る。

``` js
const copiedObj = JSON.parse(JSON.stringify(obj));
```

この方法により、`Object.assign`で起きていた予期せぬ変更は起きなくなる。

``` js
console.info(obj === copiedObj);// false

obj.date.setMonth(obj.date.getMonth() + 1);
console.info(obj.date);       // 2019-05-11T06:54:30.000Z
console.info(copiedObj.date); // 2019-04-11T06:54:30.000Z

obj.ar.push(8);
console.info(obj.ar);         // [ 1, 2, 3, 8 ]
console.info(copiedObj.ar);   // [ 1, 2, 3 ]

obj.ob.str = '変更後の別のテキスト';
console.info(obj.ob.str);       // 変更後の別のテキスト
console.info(copiedObj.ob.str); // 別のテキスト
```

しかし、次のようにコピー先のオブジェクトには値が欠落していたり、元どおりの値がコピーされていないことがある。
- `undefined`のプロパティが欠落
- Functionオブジェクトが欠落
- Symbol型の値が欠落
- Dateオブジェクトが文字列になる

```js 
console.info(copiedObj);
{ str: 'テキスト',
  num: 3,
  bl: true,
  nl: null,
  date: '2019-04-11T06:54:30.000Z',
  ar: [ 1, 2, 3 ],
  ob:
   { str: '別のテキスト',
     num: 10,
     bl: false,
     nl: null,
     date: '2019-04-11T15:01:23.000Z',
     ar: [ 5, 6, 7 ] } }
```

この方法は簡易であり、APIで受け取ったJSONをフロント側で保持する際には、`Date`オブジェクトや`Symbol`に変換して保持せず、`undefined`のプロパティが欠落することを押さえておけば`Object.assign`メソッドを使うよりは、コピー元とコピー先の値を比較する要件は満たしやすい。  
しかし、コピーできたと思っていた値がコピーできていないことがあるためバグをうむ可能性がある。

## Lodashを使ったディープコピー
外部のライブラリを使うことに制約がないのであれば、`lodash`で提供されている![cloneDeep](https://lodash.com/docs/4.17.11#cloneDeep)を使うのがよい。

`lodash`をインストールして、ディープコピーされているか見ていく。
``` sh
npm i --save lodash
```

package.json
``` json
{
  "dependencies": {
    "lodash": "^4.17.11"
  }
}
```

lodashの`cloneDeep`によりオブジェクトをコピーすると、`JSON.parse(JSON.stringify(obj))`でコピーしていた時に欠落していたものが、欠落せずただしくコピーできていることがわかる。
- `undefined`のプロパティが欠落しない
- Functionオブジェクトが欠落しない
- Symbol型の値が欠落しない
- Dateオブジェクトが復元できる

``` js
const cloneDeep = require('lodash/cloneDeep');
const copiedObj = cloneDeep(obj);
console.info(copiedObj);

{ str: 'テキスト',
  num: 3,
  bl: true,
  nl: null,
  ud: undefined,
  sy: Symbol(heart),
  date: 2019-04-11T06:54:30.000Z,
  fn: [Function: fn],
  ar: [ 1, 2, 3 ],
  ob:
   { str: '別のテキスト',
     num: 10,
     bl: false,
     nl: null,
     ud: undefined,
     sy: Symbol(spade),
     date: 2019-04-11T15:01:23.000Z,
     fn: [Function: fn],
     ar: [ 5, 6, 7 ] } }
```

## まとめ
- Object.assignを使う場合は、シャローコピーであることを意識する
- 外部ライブラリの制約がないなら、lodashのcloneDeepでディープコピーする
