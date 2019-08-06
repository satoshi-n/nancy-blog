---
title: Cloud Pub/Subの配信タイプpullのサブスクリプションをgcloudツールで試す
description: Cloud Pub/Subとは何かを説明した後、配信タイプpullのサブスクリプションをgcloudコマンドラインツールで実際に動かして見る
date: 2019-05-24
categories:
  - Google Cloud
tags:
  - Cloud Pub Sub
permalink: /using-google-cloud-pub-sub-pull-with-gcloud-tool
---

# {{ $page.title }}

<PostMeta/>

Cloud Pub/Subとは何かを説明した後、配信タイプpullのサブスクリプションをgcloudコマンドラインツールで実際に動かして見る。  

## Cloud Pub/Subとは
Cloud Pub/Subはパブリッシュ-サブスクライブ方式(Publish-Subscribe)でメッセージを送受信するサービスだ。  
メッセージを作成して送信するクライアントをパブリッシャー(Publisher)といい、メッセージを受信するクライアントをサブスクライバー(Subscriber)という。  
パブリッシャーはトピック(Topic)と呼ばれる送信先にメッセージをパブリッシュ(送信)する。トピックに登録されたメッセージは、サブスクリプション(Subscription)と呼ばれるトピックの送受信を管理する機能により、そのトピックをサブスクライブ(購読)していたサブスクライバーへ配信される。  
   
## 用途
ユーザーがアカウントを新規作成した際に、ユーザーには仮登録しましたとサーバーから返しておき、バックグラウンドでメールを送るような非同期処理で使われる。  
また、1対多でメッセージを送ることができるため、複数人に同じメッセージを同時に送るメッセージアプリでも使うことができる。  

## push サブスクリプションと pull サブスクリプション
トピックの送受信を管理するサブスクリプションには、メッセージの配信タイプとしてpullとpushの2つがある。pullはメッセージを受信するサブスクライバーが自らメッセージを取りに行く配信タイプだ。一方で、pushはメッセージを受信するサブスクライバーがメッセージを自ら取りに行かなくても、サブスクリプションからあらかじめ指定された配信先にメッセージを自動で配信する。  

## gcloud コマンドライン ツールで配信タイプpullのPub/Subを試す
それではgcloud コマンドライン ツールを使って、実際に配信タイプpullのCloud Pub/Subを動かして見る。  
次の手順でCloud Pub/Subを試すことができる。  

1. トピックを作成する  
`gcloud pubsub topics create [トピックID]`でトピックIDを指定してトピックを作成する。  
コマンド実行後に出力される`projects/using-pub-sub/topics/my-topic`の部分は
`projects/[プロジェクトID]/topics/[トピックID]`であり、トピックを一意にする完全修飾識別子だ。  

``` sh
$ gcloud pubsub topics create my-topic
Created topic [projects/using-pub-sub/topics/my-topic].
```

2. トピックを登録する  
`gcloud pubsub subscriptions create --topic [トピックID] [サブスクリプションID]`でトピックをどのサブスクリプションで管理するか決める。  
`--push-endpoint=[プッシュエンドポイント]`オプションを指定しない場合、サブスクリプションはpull配信になる。つまり、メッセージの受信者であるサブスクライバーは自らサブスクリプションに対してpullすることで、メッセージを取得する。  
コマンド実行後に出力される`projects/using-pub-sub/subscriptions/my-sub`の部分は
`projects/[プロジェクトID]/topics/[サブスクリプションID]`であり、サブスクリプションの完全修飾識別子だ。  

``` sh
$ gcloud pubsub subscriptions create --topic my-topic my-sub
Created subscription [projects/using-pub-sub/subscriptions/my-sub].
```

3. メッセージをトピックにパブリッシュする  
`gcloud pubsub topics publish [トピックID] --message [メッセージ]`によりメッセージをトピックにパブリッシュする。メッセージには一意なIDが割り当てられる。  
`--attribute=[属性,…]`オプションにより、カンマ区切りで属性を指定することができる。各属性は`name=value`の形式で100個まで登録できる。

属性なしでメッセージをトピックにパブリッシュする場合
``` sh
$ gcloud pubsub topics publish my-topic --message "hello"
messageIds:
- '634318300155621'
```

属性ありでメッセージをトピックにパブリッシュする場合  
``` sh
$ gcloud pubsub topics publish my-topic --message "hello" --attribute KEY1=VAL1
messageIds:
- '634318300155621'
```

4. メッセージを受信する  
`gcloud pubsub subscriptions pull [サブスクリプションID]`によりメッセージを受信する。  
`--auto-ack`オプションをつけることでサブスクリプションに対してメッセージを受信したことを伝え、再度配信されないようにする。  

``` sh
$ gcloud pubsub subscriptions pull --auto-ack my-sub
┌───────┬─────────────────┬────────────┐
│  DATA │    MESSAGE_ID   │ ATTRIBUTES │
├───────┼─────────────────┼────────────┤
│ hello │ 634318300155621 │            │
└───────┴─────────────────┴────────────┘
```

## 参考  
https://cloud.google.com/pubsub/docs/overview  
http://tech-blog.tsukaby.com/archives/1298  
https://gist.github.com/voluntas/89000a06a7b79f1230ab  
