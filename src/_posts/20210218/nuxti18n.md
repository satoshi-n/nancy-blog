---
title: nuxt-i18nで日本語と英語に対応する
description: nuxt-i18nでブラウザの言語を自動で検知し多言語対応する。locales、langDir、lazy、defaultLocale、fallbackLocale、detectBrowserLanguage、strategyオプションの設定方法を説明する。
date: 2021-02-18
categories:
  - vue
permalink: /nuxti18n
---
# {{ $page.title }}

<PostMeta/>

[nuxt-i18n](https://i18n.nuxtjs.org/)でブラウザの言語を自動で検知し、日本語と英語に対応する。  
locales、langDir、lazy、defaultLocale、fallbackLocale、detectBrowserLanguage、strategyオプションを設定して動作を確認していく。  

## 環境準備
`nuxt-app`でNuxt環境を構築する。  
``` sh
$ npm init nuxt-app nuxt-i18n-example
create-nuxt-app v3.2.0
✨  Generating Nuxt.js project in nuxt-i18n-example
? Project name: nuxt-i18n-example
? Programming language: JavaScript
? Package manager: Npm
? UI framework: None
? Nuxt.js modules: (Press <space> to select, <a> to toggle all, <i> to invert selection)
? Linting tools: (Press <space> to select, <a> to toggle all, <i> to invert selection)
? Testing framework: None
? Rendering mode: Single Page App
? Deployment target: Static (Static/JAMStack hosting)
? Development tools: jsconfig.json
```

`nuxt-i18n`をインストールする。  
``` sh
$ npm install nuxt-i18n
```

## nuxt.config.jsにi18nの設定をする

`nuxt.config.js`
``` js
modules: [
  'nuxt-i18n',
],
i18n: {
  locales: [
    { code: 'ja', iso: 'ja_JP', file: 'ja.js' },
    { code: 'en', iso: 'en-US', file: 'en.js' },
  ],
  lazy: true,
  langDir: 'locales/',
  defaultLocale: 'ja',
  vueI18n: {
    fallbackLocale: 'ja',
  },
  detectBrowserLanguage: { alwaysRedirect: true },
},
```

### localesオプション、langDirオプション
`code` ... ロケールを一意にする名前を設定する  
`iso`　... ブラウザの言語設定を検知し、合致した`file`の言語を設定する  
`file` ... 言語のファイル。JavaScriptで設定できるためJSONと違いコメントをつけることができ、末尾に`,`がついていてもよい。    
`langDir`オプションで`file`の格納ディレクトリを指定する。  

`locales/ja.js`  
``` js
export default {
  hello: 'こんにちは',
  login: 'ログイン画面です',
}
```

`locales/en.js` 
``` js
export default {
  hello: 'Hello!',
  login: 'login page',
}
```

### lazyオプション
lazyオプションを設定すると`lang-ja.js`と`lang-en.js`のように言語ごとにファイルが分かれてダウンロードされるようになり、必要な言語のみが読み込まれる。  
そのため、翻訳するコンテンツが多い場合はlazyオプションを設定するとよい。  

### defaultLocaleオプション
localesオプションで設定したいずれかの`code`を設定する。  
`prefix_except_default`オプションを明示的に指定していない場合、ここで設定した言語以外にはURLに`code`の値が追加される。    
たとえば`defaultLocale`に`ja`を設定した場合、  
ブラウザの言語設定が日本語だった場合トップページは`http://localhost:3000/`で表示されるが、
ブラウザの言語設定が英語だった場合トップページは`http://localhost:3000/en`で表示される。  

### vueI18n.fallbackLocaleオプション
ブラウザの言語設定がいずれにも一致しなければ`fallbackLocale`に設定された言語が表示される。  

### detectBrowserLanguageオプション
1回目のサイトへのアクセス時は言語検知を行って、その言語へ自動でリダイレクトしてくれるが、2回目以降のサイトへのアクセス時にはリダイレクトしてくれなくなる。  
そこで、`{ alwaysRedirect: true }`を設定すると2回目以降でもCookieの値をもとにリダイレクトしてくれる。  

## 確認用の画面を用意してブラウザからアクセスしてみる
トップページ(`index.vue`)とそこから遷移する先のログインページ(`login.vue`)を用意する。  
画面遷移には`NuxtLink`のtoに`localePath`を呼び出して遷移する。  

`index.vue`  
``` vue
<template>
  <div>
    {{ $t('hello') }}
    <NuxtLink :to="localePath('/login')">Go to login page</NuxtLink>
  </div>
</template>
```

`login.vue`  
``` vue
<template>
  <div>
    {{ $t('login') }}
  </div>
</template>
```

言語の優先度が「日本語」の場合に`http://localhost:3000/`へアクセスすると、
「こんにちは Go to login page」と表示される。
CookieにはName:`i18n_redirected`、Value:`ja`が保存される。  
  
言語の優先度が「英語」の場合に`http://localhost:3000/`へアクセスすると、`http://localhost:3000/en`へリダイレクトされ
「Hello! Go to login page」と表示される。  
CookieにはName:`i18n_redirected`、Value:`en`が保存される。  

## ロケールごとに別のURLとせず同じURLにする
デフォルトではロケールごとに別のURLが割り当てられるが、同じURLにするには`strategy`オプションに`no_prefix`を設定する。  

`nuxt.config.js`
``` js

i18n: {
  strategy: 'no_prefix',
},
```
