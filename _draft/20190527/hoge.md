---
title: Cloud Pub/Subの配信タイプpushのメッセージをGoogle App Engine StandardのPython3.7で受け渡しする
description: Cloud Pub/Subの配信タイプpushのメッセージをGoogle App Engine StandardのPython3.7で受け渡しする
date: 2019-05-27
categories:
  - Google Cloud
tags:
  - Cloud Pub Sub
  - Google App Engine Standard
permalink: /using-google-cloud-pub-sub-to-push-to-google-cloud-functions
---

# {{ $page.title }}

<PostMeta/>

Google App Engine StandardのPython3.7からCloud Pub/Subへメッセージをパブリッシュし、Cloud Pub/SubからGoogle App Engine StandardのPython3.7へプッシュするアプリを作ってみる。  
なお、メッセージの送受信で同じGoogle App Engine Standardを使う。  

全体像  
`
Google App Engine Standard → [publish] → Pub/Sub → [push] → Google App Engine Standard
`

## 


https://github.com/GoogleCloudPlatform/python-docs-samples/tree/master/appengine/standard/pubsub