---
title: Babel 7.4.0で非推奨になった@babel/polyfillを使わず、core-js@3で環境構築する
description: Babel 7.4.0で非推奨になった@babel/polyfillを使わず、core-js@3で環境構築する
date: 2019-05-22
categories:
  - JavaScript
tags:
  - Babel
permalink: /migrate-babel-polyfill-to-core-js
---

# {{ $page.title }}

<PostMeta/>

[@babel/polyfill](https://babeljs.io/docs/en/next/babel-polyfill.html)のページにBabel 7.4.0から非推奨になったと書かれている。  
> As of Babel 7.4.0, this package has been deprecated

この記事ではwebpack4でBabel7.4を使った環境構築の方法を記載する。  

## 環境構築

### インストール
`@babel/polyfill`ではなく`core-js`と`regenerator-runtime`をインストールしているのがポイント。  
Polyfillは`core-js`にまとめられており、async-awaitを動かすには`regenerator-runtime`が別で必要になる。  
そのほか、BabelやWebpackでビルドするために必要なモジュールをインストールする。  

``` sh
npm install --save-dev @babel/core @babel/preset-env core-js regenerator-runtime webpack webpack-cli babel-loader
```

### packge.json
npm-scriptsに`build`を追加して、`npm run build`実行時にwebpackのビルドが動くようにする。  

`package.json`
``` json{3}
{
  "scripts": {
    "build": "webpack"
  },
  "devDependencies": {
    "@babel/core": "^7.4.5",
    "@babel/preset-env": "^7.4.5",
    "babel-loader": "^8.0.6",
    "core-js": "^3.1.2",
    "regenerator-runtime": "^0.13.2",
    "webpack": "^4.32.1",
    "webpack-cli": "^3.3.2"
  }
}
```

### webpack.config.jsの作成
`webpack.config.js`にwebpack実行時の設定を記載する。  
`module`の`rules`の中で`babel-loader`の指定をする。

`webpack.config.js`  
``` js
const path = require('path');

module.exports = {
  mode: "development",
  entry: path.resolve(__dirname, "src/index.js"),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: "babel-loader",
          }
        ]
      }
    ]
  }
};
```

### babel.config.jsの作成
`babel.config.js`にbabelの設定を記載する。  
presetsに`@babel/preset-env`を指定し、オプションに`useBuiltIns`および`corejs`を指定する。  
こう設定することにより、ビルドしたJavaScriptファイルで必要なモジュールのみをインポートする。  

`babel.config.js`
``` js
module.exports = function (api) {
  api.cache(true);

  const presets = [["@babel/preset-env", {
      useBuiltIns: "usage",
      corejs: 3,
    }]];

  return {
    presets,
  };
}
```

### テスト用のJavaScriptを用意する
エントリーポイントにする`index.js`を用意する。  
Polyfillが含まれることを確認するため、IE11で対応していない`Array.prototype.includes`を記載する。  
さらに、async-awaitが動くことを確認するために、`wait`関数を用意し、無名関数の中で呼び出す。
また、importの確認のために`add.js`を用意する。

`index.js`
``` js
import add from './add';

console.info(add(2, 3));
console.info(['hoge', 'fuga', 'piyo'].includes('piyo'));

const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
(async () => {
  console.log('start');
  await wait(2000);
  console.log('end')
})();
```

`add.js`
``` js
export default function(a, b) {
  return a + b;
}
```

### ビルド実行
実行前のディレクトリは以下のとおり。
`src`ディレクトリ下にエントリーポイントとなる`index.js`と、関数をexportしている`add.js`を配置している。  
また、出力先の`dist`ディレクトリを用意している。  
``` sh
.
├── babel.config.js
├── dist
├── package-lock.json
├── package.json
├── src
│   ├── add.js
│   └── index.js
└── webpack.config.js
```

ビルドを実行すると、`dist`ディレクトリに`bundle.js`が出力される。  
``` sh
npm run build
```

出力された`bundle.js`の中をのぞいて見ると、importした`/***/ "./src/add.js":`や、
Polyfillの`"./node_modules/core-js/modules/es.array.includes.js"`、
そして、async-awaitで必要な`/***/ "./node_modules/regenerator-runtime/runtime.js":`などが組み込まれていることを確認できる。

・参考  
https://babeljs.io/docs/en/next/babel-polyfill.html  
https://babeljs.io/blog/2019/03/19/7.4.0  
https://github.com/zloirock/core-js/blob/master/docs/2019-03-19-core-js-3-babel-and-a-look-into-the-future.md  
https://github.com/babel/babel-loader  
