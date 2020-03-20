---
title: Nuxt.jsでdotenv-moduleを使い、nuxt.config.jsから値が読み取れないときの原因と対応
description: Nuxt.jsでdotenv-moduleを使い、nuxt.config.jsから値が読み取れないときの原因と対応
date: 2019-08-08
categories:
  - Vue.js
tags:
  - Nuxt.js
permalink: /nuxt-dotenv-module-pitfall
---
# {{ $page.title }}


<PostMeta/>

`.env`のファイル名を変更したり、パスを変更していると`nuxt.config.js`で`require('dotenv').config()`しても設定を読み込めない。
`require('dotenv').config({ path: envPath })`のように、`config()`の引数でファイルのパスを指定すれば読み込めるようになる。  
  
以下検証。  
  
Nuxt.jsでローカル環境、dev環境、本番環境でそれぞれ異なるAPIのURLを使いたい。  
環境依存のものは環境ごとのファイルで管理したかったので、[nuxt-community/dotenv-module](https://github.com/nuxt-community/dotenv-module)を使うことにした。しかし、`nuxt.config.js`で`axios`の`baseURL`を設定する際にハマったので記事を残しておく。  

ディレクトリ構成としては、ローカル環境用の`.env.local`、dev環境用の`.env.development`、本番環境用の`.env.production`を用意し、`config`ディレクトリにまとめる形にした。  

``` sh{1-4}
├── config
│   ├── .env.development
│   ├── .env.local
│   └── .env.production
├── README.md
├── assets
├── components
├── layouts
├── middleware
├── node_modules
├── nuxt.config.js
├── package-lock.json
├── package.json
├── pages
├── plugins
├── static
└── store
```

## Nuxt.jsのインストール
実際にNuxt.jsで環境ごとに異なるファイルを読み込むプロジェクトを作る。  
まずは`create-nuxt-app`でNuxt.jsのプロジェクトを作成する。  
APIのURLを確認するため`axios`をインストールする。自分はSPAで使うので`rendering mode`に`Single Page App`を選んでいる。  
他は特に設定しない。

``` sh
$ npx create-nuxt-app nuxt-dotenv-test
> Generating Nuxt.js project in /path/to/project
? Project name nuxt-dotenv-test
? Project description My ace Nuxt.js project
? Use a custom server framework none
? Choose features to install Axios
? Use a custom UI framework none
? Use a custom test framework none
? Choose rendering mode Single Page App
? Author name nansystem
? Choose a package manager npm
```

コマンドラインに表示されている通りに、起動の確認を行う。  
``` sh
$ cd nuxt-dotenv-test
$ npm run dev
```

## @nuxtjs/dotenvのインストールとnuxt.config.jsの設定
`@nuxtjs/dotenv`をインストールする。  

``` sh
$ npm install @nuxtjs/dotenv
```

`nuxt.config.js`の`modules`に`@nuxtjs/dotenv`を追加する。  
``` js{2}
  modules: [
    '@nuxtjs/dotenv',
    '@nuxtjs/axios',
  ],
```

`Nuxt.js`で`.env`ファイルが読み込めることを確認するため、プロジェクトのルート階層に`.env`ファイルを用意する。

`.env`
```
MESSAGE="hello!"
```

### componentからprocess.envで設定した値が取得できることを確認する
`pages/index.vue`に`mounted()`を追加し、`process.env`から追加した値が取得できるか確認する。  
``` vue{8-10}
<script>
import Logo from '~/components/Logo.vue'

export default {
  components: {
    Logo
  },
  mounted() {
    console.log(process.env.MESSAGE)
  }
}
</script>
```

ChromeのConsoleを開くと`hello!`と表示されており、`.env`から値を取得できている。

### nuxt.config.jsからprocess.envで設定した値が取得できることを確認する
次に、`nuxt.config.js`から`.env`の値を読み取れることを確認していく。

`nuxt.config.js`に次の記述を追加する。1行目の`import pkg`は`create-nuxt-app`で生成した際に記述されていたので無視して、`require('dotenv').config()`を追加し、`console.info`で値が取得できるか確認する。  
``` js{2-3}
import pkg from './package'
require('dotenv').config()
console.info('nuxt.config.js MESSAGE:', process.env.MESSAGE)
```

起動ログに`.env`で設定したとおり`hello!`が表示されていればOK。
``` sh
↻ Updated nuxt.config.js
ℹ nuxt.config.js MESSAGE: hello!
```

### configディレクトリに.env.local、.env.development、.env.productionを作成し、それぞれ取得できることを確認する

`package.json`の`scripts`にローカル環境、dev環境、本番環境用のビルドスクリプトを追加する。  
``` json {6-8}
  "scripts": {
    "dev": "nuxt",
    "build": "nuxt build",
    "start": "nuxt start",
    "generate": "nuxt generate",
    "build-local": "ENV=local nuxt build",
    "build-development": "ENV=development nuxt build",
    "build-production": "ENV=production nuxt build"
  },
```

環境ごとの`.env`ファイルを用意する。
  
`.env.local`
``` 
BASE_URL="http://localhost:8080"
```

`.env.development`
``` 
BASE_URL="http://example.com/dev"
```

`.env.production`
``` 
BASE_URL="http://example.com/prod"
```

`nuxt.config.js`を書き換えて、`config`ディレクトリ下の`.env`ファイルを参照するようにする。  
自分はここでハマった。ドキュメントに
> just append require('dotenv').config() to your nuxt.config.js
と書かれているから`config()`の引数に何も指定していなかったのだけど、`path`を指定してやる必要がある。  キー名は`filename`ではなく`path`なのも注意ポイント。  
あとは`axios`の`baseURL`を指定すればよい。  

`nuxt.config.js`
``` sh
...略
const envPath = `config/.env.${process.env.ENV || 'local'}`
require('dotenv').config({ path: envPath })
...略
  modules: [
    '@nuxtjs/dotenv',
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
  ],
  dotenv: {
    filename: envPath
  },
  axios: {
    baseURL: process.env.BASE_URL,
  },
```

`axios`にURLを設定できていることを確認するため、`index.vue`に`this.$axios.defaults.baseURL`を表示するようにしておく。  
``` vue
  mounted() {
    console.info('this.$axios.defaults.baseURL:', this.$axios.defaults.baseURL)
  }
```

ローカル用にビルドして、サーバを立ち上げる。  
``` sh
$ npm run build-local
$ npm start
```
トップ画面のコンソールを表示すると、`baseURL`が設定できている。  

``` sh
this.$axios.defaults.baseURL: http://localhost:8080
```

同様にdev環境用、本番環境用にビルドしても、`baseURL`が設定できている。

``` sh
$ npm run build-development
$ npm start
```

``` sh
this.$axios.defaults.baseURL: http://example.com/dev
```

## ちなみに...
dotenvのREADMEには`.env`ファイルをコミットすべきではないし、`.env`ファイルを複数持つべきじゃないと書かれてる。
> Should I commit my .env file?
No. We strongly recommend against committing your .env file to version control. 

> Should I have multiple .env files?
No. We strongly recommend against having a "main" .env file and an "environment" .env file like .env.test.
https://github.com/motdotla/dotenv#readme

