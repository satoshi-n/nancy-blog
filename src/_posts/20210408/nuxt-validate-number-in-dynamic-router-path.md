---
title: Nuxt ルーティングでURLパスのidを数値チェックする
description: ファイルシステムに基づくルーティングで動的なルーティングを設定した際の、パラメーターの数値チェックをvalidateメソッドで行う
date: 2021-04-08
categories:
  - vue
permalink: /nuxt-validate-number-in-dynamic-router-path
---
# {{ $page.title }}

<PostMeta/>

Nuxtで`http://localhost:3000/users/:id`のようにURLのパスが数値であることを検証する方法を記載する。  
`validate`メソッドを使うことで検証できる。  

## 環境構築
Nuxtアプリケーションをインストールする。  
ルーティングはデフォルトで入っているので、特別必要なプラグインはない。  
なお、ここでは`@nuxtjs/composition-api`を使っているが、使わない場合でも同じ方法でURLのパスは検証できる。  

``` sh
$ npx create-nuxt-app path-guard
create-nuxt-app v3.2.0
✨  Generating Nuxt.js project in path-guard
? Project name: path-guard
? Programming language: TypeScript
? Package manager: Npm
? UI framework: None
? Nuxt.js modules: (Press <space> to select, <a> to toggle all, <i> to invert selection)
? Linting tools: ESLint, Prettier, Lint staged files, StyleLint
? Testing framework: None
? Rendering mode: Single Page App
? Deployment target: Static (Static/JAMStack hosting)
? Development tools: jsconfig.json (Recommended for VS Code if you're not using typescript), Semantic Pull Requests

$ npm install @nuxtjs/composition-api --save
# nuxt.config.jsのbuildModulesに'@nuxtjs/composition-api/module'を追加する
```

## /users/:idのルーティングの確認

`users`ディレクトリを追加し、そのディレクトリに`_id.vue`と`index.vue`を追加する。

``` sh
$ tree pages
pages
├── README.md
├── index.vue      # http://localhost:3000/
└── users
    ├── _id.vue    # http://localhost:3000/users/:id
    └── index.vue  # http://localhost:3000/users
```

`pages/users/index.vue`
``` vue
<template>
  <p>user list</p>
</template>
```

`pages/users/_id.vue`
``` vue
<template>
  <p>user detail</p>
</template>
```

アプリケーションを起動して`http://localhost:3000/users`にアクセスすると`user list`、  
`http://localhost:3000/users/32`にアクセスすると`user detail`と表示されることを確認する。  
``` sh
$ npm run dev
```

## /users/:idの数値バリデーション
このままだと`http://localhost:3000/users/xxx`のように`/users/`の後ろはどんな文字でもアクセスできてしまう。  
実際のアプリケーションではURLのパスでuserを示すID(数値)を受け取って、`/api/v1/users/32`のようなAPIリクエストをする。  
そのためURLのパスの値を`validate`メソッドにより検証する。  
  
ファイル名の`_id.vue`が`params.id`と紐づいている。  
ファイル名を`_userid.vue`とすれば`params.userid`でパスの値を取得できる。  
以下の例では`id`が数値であることを検証している。  

`pages/users/_id.vue`
``` vue
<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  validate({ params }) {
    return /^\d+$/.test(params.id)
  }
})
</script>
```

こうすることで、`http://localhost:3000/users/hoge`のようなアクセスがあった際に、
`This page could not be found`と表示されるページ(404ページ)へ遷移させることができる。  

IDはたいていの場合0より大きい数字であろうから、以下の正規表現で0でない数値であることを保証できる。  
``` vue
validate({ params }) {
  return /^[1-9][0-9]*$/.test(params.id)
}
```

また、最大値を簡易的に検証するには`{0,9}`のようにすることで桁数を検証できる。  
この場合、`[1-9]`で1桁、`[0-9]{0,9}`で最大9桁、合わせて最大10桁まで許容している。  
``` vue
validate({ params }) {
  return /^[1-9][0-9]{0,9}$/.test(params.id)
}
```

具体的な最大値が決まっている場合には、Numberに変換して数値にすることで比較しやすくなる。  
``` vue
validate({ params }) {
  const isNum = /^[1-9][0-9]{0,9}$/.test(params.id)
  if (!isNum) return false
  const num = Number(params.id)
  return num < 123456789
}
```

なお、正規表現でのチェックをせずに`Number(params.id)`とした場合はidに以下のような値を許容することになる。  
``` 
010        # 10
-1         # -1
0.1        # 0.1
123e-1     # 12.3
-Infinity  # -Infinity
0x11       # 17
```

参考  
https://composition-api.nuxtjs.org/getting-started/setup  
https://nuxtjs.org/docs/2.x/components-glossary/pages-validate  
https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number  
