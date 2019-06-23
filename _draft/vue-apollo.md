---
title: vue-apollo + Graphene + Flask
description: vue-apollo + Graphene + Flask
date: 2019-06-21
categories:
  - Vue  
  - Python
tags:
  - GraphQL
permalink: /vue-apollo-graphene-flask
---
# {{ $page.title }}

<PostMeta/>

## apolloとは

## GrapheneでGraphQLサーバーを構築する

## vue-apolloでGraphQLサーバーへQueryする

`@vue/cli`をインストールする。  

``` sh
$ npm install -g @vue/cli
$ vue --version
3.8.4
```

`@vue/cli-service-global`をインストールする。  
``` sh
$ npm install -g @vue/cli-service-global
```

プロジェクトを新規に作成する。  
``` sh
$ vue create apollo-graphene
```

apolloクライアントをインストールする。
```
$ vue add apollo
~/git/vue-apollo-graphene-flask/apollo-graphene $ vue add apollo

📦  Installing vue-cli-plugin-apollo...

+ vue-cli-plugin-apollo@0.20.0
updated 1 package in 53.665s
✔  Successfully installed plugin: vue-cli-plugin-apollo

? Add example code Yes
? Add a GraphQL API Server? Yes
? Enable automatic mocking? Yes
? Add Apollo Engine? Yes
? API Key (create one at https://engine.apollographql.com): service:nansystem-9034:nS99bxM2dqCfYe9oKhF6wA
```

