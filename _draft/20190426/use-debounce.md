---
title: JavaScript debounceを使う
description: 
date: 2019-04-26
categories:
  - JavaScript
permalink: /use-debounce
---

# {{ $page.title }}

<PostMeta/>

## debounceとは
`debounce`とは一定期間内に繰り返し実行されるコードのパフォーマンスを向上させる手法の1つ。
指定された期間内の関数の呼び出しを全て無視し、指定された期間が経過した後に関数を実行する。

## 使い所
検索の入力候補を表示する際に使う。
APIの呼び出し回数を減らし、ユーザーの待ち時間を減らす

## lodashのdebounceで実装してみる

``` sh
$ npm install --save express
```

のサンプルを作ってみる
``` html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>debounce</title>
</head>
<body>
<input type="text" class="search" />

<script src="https://cdnjs.cloudflare.com/ajax/libs/axios/0.18.0/axios.js"></script>
<script>
const searchElm = document.querySelector('.search');
const serach = async (e) => {
  const res = await axios.get(`http://localhost:3000/prefectures?q=${e.target.value}`)
  console.info(res.data);
};
searchElm.addEventListener('input', serach, false);
</script>
</body>
</html>
```　

・参考
https://slideship.com/users/@iktakahiro/presentations/2017/12/MArWbm3VYEKCqB2ZNd5dts/?p=3  
https://blog.bitsrc.io/understanding-throttling-and-debouncing-973131c1ba07  
