---
title: JavaScript ejsの使い方
description: テンプレートエンジンであるejsの基本的な使い方を見ていく。
date: 2019-03-15
categories:
  - JavaScript
tags:
  - ejs
permalink: /getting-started-with-ejs
---

# {{ $page.title }}

<PostMeta/>

テンプレートエンジンである`ejs`の基本的な使い方を見ていく。

[[toc]]

## ejsとは
[ejs](https://ejs.co/)はJavaScript用のテンプレートエンジンだ。  
ejsを使うことでHTMLをヘッダーやフッターで分割してファイルを管理したり、HTMLエスケープをしたり、繰り返し処理や分岐を簡潔に記述できるようになる。

## ejsのインストール
``` sh
npm install ejs --save-dev
```

package.json
``` json
{
  "devDependencies": {
    "ejs": "^2.6.1"
  }
}
```

ディレクトリ
``` sh
.
├── index.js
├── package-lock.json
└── package.json
```

## ejsの基本的な使い方
### 変数の展開
使い方  
`ejs.render(テンプレート(必須)、テンプレート内で使う変数(任意)、オプション(任意)、非同期(任意))`

ejsのrender関数を呼び出すことで、テンプレート内の変数を展開できる。  
第1引数にテンプレートを指定する。テンプレートは`<%=`と`%>`で囲む。  
第2引数にテンプレート内で使う変数を指定する。`{テンプレート内での変数名: 値}`として設定する。

index.js
``` js
const ejs = require('ejs');

const people = ['山田', '田中', '加藤'];
const html = ejs.render('<%= people.join(", "); %>', { people: people });
console.info(html);
```

実行すると、テンプレートで指定した`people`がカンマ区切りになって出力される。
``` sh
$ node index.js
山田, 田中, 加藤
```

テンプレート内で使う変数は複数指定でき、プリミティブデータ型(文字列や数値など)、配列、オブジェクトいずれを指定してもよい。

index.js
``` js
const ejs = require('ejs');

const people = ['山田', '田中', '加藤'];
const yamada = {
    name: '山田',
    height: '176cm',
}
const number = 10;
var template = `<h2>人</h2>
<%= people.join(", "); %>
<h2>詳細</h2>
<%= number %>番目
<%= yamada.name %>
<%= yamada.height %>
`;
const html = ejs.render(template, { people: people, yamada: yamada, number: number });
console.info(html);
```

出力結果
``` html
<h2>人</h2>
山田, 田中, 加藤
<h2>詳細</h2>
10番目
山田
176cm
```

### 分岐
ここまで変数を展開する際には`<%=`、`%>`で囲んできたが、`<%=`にはHTMLエスケープを行うという意味がある。  
分岐や繰り返しの処理には`=`をつけず`<%`、`%>`で囲む。
`<%`、`%>`の中では普通のJavaScritのようにif文を書くことができる。

index.js
``` js
const ejs = require('ejs');

const name = '';
var template = `<h2>人</h2>
<% if (name) { %>
<%= name %>
<% } else { %>
名無しです
<% } %>  
`;
const html = ejs.render(template, { name: name});
console.info(html);
```
<br>
同様にswitch文も使うことができる。

index.js
``` js
const ejs = require('ejs');

const role = 'admin';
var template = `<h2>権限</h2>
<% switch (role) {
case 'admin' : %>
システム管理者
<% break;

case 'operator' : %>
オペレーター
<% break;

case 'user' : %>
一般ユーザー
<% break;
} %>
`;
const html = ejs.render(template, { role: role});
console.info(html);
```

出力
``` html
<h2>権限</h2>

システム管理者
```

### 繰り返し
if文やswitch文と同様に、`<%`、`%>`内で`forEach`などを使うこともできる。

``` js
const ejs = require('ejs');

const people = ['山田', '田中', '加藤'];
var template = `<h2>人</h2>
<% people.forEach((person)=>{ %>
<%= person %>さん
<% }) %>
`;
const html = ejs.render(template, { people: people});
console.info(html);
```

出力
``` html
<h2>人</h2>

山田さん

田中さん

加藤さん
```

### 不要な空白の除去
分岐や繰り返しの出力結果で見たように、変数を展開した際に不要な空白が入ってしまう。
`_%>`タグで閉じることで不要な空白を除去することができる。

``` js
const ejs = require('ejs');

const people = ['山田', '田中', '加藤'];
var template = `<h2>人</h2>
<% people.forEach((person)=>{ _%>
<%= person %>さん
<% }) _%>
`;
const html = ejs.render(template, { people: people});
console.info(html);
```

出力
``` html
<h2>人</h2>
山田さん
田中さん
加藤さん

```

<!-- ### エラー
```
const ejs = require('ejs');

const people = [];
var template = `<h2>人</h2>
<%= if(people.length > 0){ %>
<%= } %>
`;
const html = ejs.render(template, { people: people});
console.info(html);
```

```
$ node index.js
/Users/nancy/git/learn-ejs/node_modules/ejs/lib/ejs.js:634
      throw e;
      ^

SyntaxError: Unexpected token if while compiling ejs

If the above error is not helpful, you may want to try EJS-Lint:
https://github.com/RyanZim/EJS-Lint
Or, if you meant to create an async function, pass async: true as an option.
    at new Function (<anonymous>)
    at Template.compile (/Users/nancy/git/learn-ejs/node_modules/ejs/lib/ejs.js:618:12)
    at Object.compile (/Users/nancy/git/learn-ejs/node_modules/ejs/lib/ejs.js:389:16)
    at handleCache (/Users/nancy/git/learn-ejs/node_modules/ejs/lib/ejs.js:212:18)
    at Object.exports.render (/Users/nancy/git/learn-ejs/node_modules/ejs/lib/ejs.js:416:10)
    at Object.<anonymous> (/Users/nancy/git/learn-ejs/index.js:8:18)
    at Module._compile (internal/modules/cjs/loader.js:689:30)
    at Object.Module._extensions..js (internal/modules/cjs/loader.js:700:10)
    at Module.load (internal/modules/cjs/loader.js:599:32)
    at tryModuleLoad (internal/modules/cjs/loader.js:538:12)
``` -->

<!-- ## ejsのオプション
ejsのrender関数の第3引数にオプションを指定することができる。
テンプレートの囲み文字を`<%=`と`%>`から、 -->

・参考  
https://ejs.co/
