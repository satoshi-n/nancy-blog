---
title: レスポンシブ対応のCSSフレームワークをSCSSでカスタマイズできる環境をつくる
description: BulmaをSCSSでカスタマイズできる環境を構築していく。まずはSCSSをコンパイルできるようにする。そして、BulmaをSCSSでカスタマイズできるようにしていく。
date: 2019-02-16
categories:
  - CSS
tags:
  - Bulma
  - SCSS  
permalink: /how-to-customize-bluma-with-node-sass
---
# {{ $page.title }}

<PostMeta/>

レスポンシブに対応したCSSフレームワークに[Bulma](https://bulma.io/)がある。  
このBulmaのフォントや色(プライマリーからやアクセントカラーなど)、グリッド幅をSCSSでカスタマイズできる環境を構築していく。  
まずはSCSSをコンパイルできる環境を構築し、次にBulmaをSCSSでカスタマイズできるようにしていく。

[[toc]]

## node-sassでSCSSファイルをコンパイルできるようにする
SCSSファイルをコンパイルできるようにするため、`node-sass`をインストールする。  

``` sh
npm install -D node-sass
```

package.json 
``` json
{
  "devDependencies": {
    "node-sass": "^4.11.0"
  }
}
```

インストールした`node-sass`が動くことを確認しておく。  
scssディレクトリにscssファイルを作成し、cssディレクトリにコンパイルされたcssファイルを出力できるようにディレクトリとファイルを用意する。

ディレクトリ
``` bash
.
├── css
├── package-lock.json
├── package.json
└── scss
    └── style.scss
```

`style.scss`で変数を使ってみてコンパイルされるのを確認する。
`$primary-color`という変数を使って、`body`の背景色を指定する。

``` scss
$primary-color: #FF141C;

body {
  background-color: $primary-color;
}
```

`node-sass`を実行することによりSCSSからCSSを出力する。  
`node-sass 入力元のSCSSファイル 出力先のCSSファイル`という形でコンパイルすることができる。
``` sh
npx node-sass scss/style.scss css/style.css
```

出力された`style.css`を確認すると、変数が展開され`#FF141C`が設定されている。  
これでSCSSのコンパイルが確認できた。
```
body {
  background-color: #FF141C; }
```

## SCSSのコンパイルを自動化する
毎回`npx node-sass scss/style.scss css/style.css`とコマンドを打つのは手間なので、
SCSSを自動でコンパイルできるようにする。  
`npm-scripts`でSCSSファイルを`--watch`オプションにより監視する。  
`css-watch`scriptの最後に指定している`--watch`の前に書かれている`--`は、`css-build`scriptを実行する際のオプションを提供している。  
つまり、`css-watch`scriptを実行すると`node-sass scss/style.scss css/style.csc --watch`が実行されることになる。

``` sh
"scripts": {
  "css-build": "node-sass scss/style.scss css/style.css",
  "css-watch": "npm run css-build -- --watch",
  "start": "npm run css-watch"
}
```

`npm run css-build`を実行すると、`node-sass`コマンドを打っていたのと同じように`style.css`が出力される。そして、`npm start`でstyle.scssが変更されるたびに自動で`style.css`が生成されるようになる。

## bulmaをSCSSでカスタマイズできるようにする
次はbulmaをSCSSとともに使えるようにするため、bulmaをインストールする。

``` sh
npm install -D bulma
```

package.json
``` json
{
  "devDependencies": {
    "bulma": "^0.7.4",
    "node-sass": "^4.11.0"
  }
}
```

bulmaを読み込むため、`style.scss`に`@import`で`node_modules`ディレクトリ下にある`bulma.sass`を指定する。

``` scss
@charset "utf-8";
@import "../node_modules/bulma/bulma.sass";
```

そして、`index.html`を作成して`style.css`を読み込む。

index.html
``` html{7}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>My custom Bulma website</title>
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
    <h1 class="title">
        Bulma
    </h1>

    <p class="subtitle">
        Modern CSS framework based on <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox">Flexbox</a>
    </p>

    <div class="field">
        <div class="control">
            <input class="input" type="text" placeholder="Input">
        </div>
    </div>

    <div class="field">
        <p class="control">
            <span class="select">
                <select>
                    <option>Select dropdown</option>
                </select>
            </span>
        </p>
    </div>

    <div class="buttons">
        <a class="button is-primary">Primary</a>
        <a class="button is-link">Link</a>
    </div>
</body>
</html>
```

ブラウザでHTMLを確認してみると、いい感じで読み込めてる。
![Bulmaを読み込んだHTML](./bluma-site.png)


最後に、`style.scss`でbulmaのスタイルを変更できるか確かめる。
bulmaで使われるプライマリーカラー`$primary`変数を指定し、ボタンの色が変わるか確かめる。

``` scss
@charset "utf-8";
$primary: #FF141C;
@import "../node_modules/bulma/bulma.sass";
```

再度ブラウザでHTMLを確認してみると、「Primary」と書かれたボタンの色が赤色に変わっていることがわかる。

![Bulmaの色を変更したHTML](./bluma-site-changed.png)

Bulmaの変数は($primary)だけではなく、[Variables | Bulma](https://bulma.io/documentation/customize/variables/)にまとまっている。
色だけでなく、フォントやグリッドの幅も変更できる。  

以上でbulmaをSCSSでカスタマイズできる環境を構築できた✨

・参考リンク  
https://bulma.io/documentation/customize/with-node-sass/
https://docs.npmjs.com/cli/run-script
