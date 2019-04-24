---
title: Vue.jsのinputイベントがselectタグで発火しない(Internet Explorer 11)原因と対応
description: 
date: 2019-04-24
categories:
  - Vue.js
permalink: /input-event-do-not-fire-for-select-tag-in-internet-explorer
---

# {{ $page.title }}

<PostMeta/>

Internet Explorer 11において、Vue.jsの`input`イベントが`select`タグで発火しない。

### 原因
Vue.jsの問題ではなく、Internet Explorer 11では、次のように記述しても`select`タグで`input`イベントが発火しない。(ChromeやFirefoxでは発火する)

``` vue
<select @input="updateValue">
```

### 対応
`@input`ではなく`@change`を使用すればよい。
``` vue
<select @change="updateValue">
```

### v-modelはv-bind:valueとv-on:inputの組み合わせと等価とは限らない
以前`v-model`は`:value`と`@input`イベントを組み合わせたものと等価という記事を読んだことがあった。  
しかし、公式サイトには`v-model`が`text`や`select`、`radio`によって異なるイベント、値を使うことが記載されている。

> v-model は、内部的には input 要素に応じて異なるプロパティを使用し、異なるイベントを送出します:  
>   
> テキストと複数行テキストは、value プロパティと input イベントを使用します  
> チェックボックスとラジオボタンは、checked プロパティと change イベントを使用します  
> 選択フィールドは、value プロパティと change イベントを使用します  
> https://jp.vuejs.org/v2/guide/forms.html  

つまり、`text`の場合、たしかに`v-model`は`:value`と`@input`を組み合わせたものと等価だ。  

``` vue
<input type=text v-model="message">
```
⇅この2つは等価
``` vue
<input
   :value="message"
   @input="message = $event.target.value"
>
```

しかし、`select`の場合は`@input`ではなく`@change`と等価ということ。  
よって`select`や`radio`で独自のコンポーネントを作る際は`@input`イベントではなく、`@change`イベントを指定するべきだ。

``` vue
<select v-model="selected">
```
⇅この2つは等価
``` vue
<select
   :value="selected"
   @change="selected = $event.target.value"
>
```

・参考  
https://github.com/vuejs/vue/issues/4701
