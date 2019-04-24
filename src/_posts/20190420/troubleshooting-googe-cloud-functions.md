---
title: Google Cloud FunctionsをCLIで動かすまでのトラブルシューティング
description: 
date: 2019-04-20
categories:
  - Google Cloud
tags:
  - Google Cloud Functions
permalink: /troubleshooting-googe-cloud-functions
---

# {{ $page.title }}

<PostMeta/>

Google Cloud FunctionsをCLIで動かそうとしたら、すでにローカルに設定されていたファイルが邪魔をして動かすまでに手間取ったので、メモを残しておく。

[[toc]]

## GCP プロジェクトの作成とCloud Functions APIの有効化
GCP プロジェクトを作成して、Cloud Functions API を有効にしておく。

コマンドラインでGoogle Cloud Functionsを操作できるようにするため、gcloud コマンドライン ツールをインストールする。
``` sh
gcloud components update &&
gcloud components install beta
```

まずはGoogle Cloud Functionsで動かすコードを用意する。Google Cloud Functionsにデプロイできるのは`exports`した関数だ。次のコードの場合は`helloGET`関数をデプロイできる。

index.js
``` js
exports.helloGET = (req, res) => {
  res.send('Hello World!');
};
```

## Unable to create private fileの原因と対応
`gcloud beta functions deploy [関数名] --triger-http`コマンドにより、関数をデプロイする。`--triger-http`オプションによりGETでHTTPアクセスしたことをトリガーに関数が実行される。

``` sh
$ gcloud beta functions deploy helloGET --trigger-http
ERROR: (gcloud.beta.functions.deploy) Unable to create private file [/Users/**YOUR NAME**/.config/gcloud/credentials.db]: [Errno 1] Operation not permitted: '/Users/**YOUR NAME**/.config/gcloud/credentials.db'
```

実行してみると、`Unable to create private file`と表示され、
`credentials.db`が作成できないとエラーになった。  
どうやら自分の場合は以前に`Users/**YOUR NAME**/.config/gcloud/credentials.db`ファイルがすでに作成されており、`root`ユーザーで作られていたようだ。`chown`コマンドで所有者を自分に変更する。

``` sh
$ sudo chown $(whoami) /Users/**YOUR NAME**/.config/gcloud/*
```

## There was a problem refreshing your current auth tokensの原因と対応

そして、再度`gcloud`コマンドを実行する。今度は`There was a problem refreshing your current auth tokens: invalid_grant: Bad Request`というエラーが表示された。どうやらログインが必要らしい。

``` sh
$ gcloud beta functions deploy helloGET --trigger-http
ERROR: (gcloud.beta.functions.deploy) There was a problem refreshing your current auth tokens: invalid_grant: Bad Request
Please run:

  $ gcloud auth login
```

エラー表示にしたがって、`gcloud auth login`コマンドを実行する。
以下のようなURLが表示されるので、そのURLをクリックし、ブラウザに認証の画面を開く。内容を確認してログインするユーザーを選択する。
``` sh
$ gcloud auth login
Your browser has been opened to visit:

    https://accounts.google.com/o/oauth2/auth?redirect_uri=hogehoge
```

## (gcloud.beta.functions.deploy) ResponseError: status=[403], code=[Forbidden], message=[Permission denied on resource project xxx.]の原因と対応

さぁ、こんどこそ！  

``` sh
$ gcloud beta functions deploy helloGET --trigger-http
ERROR: (gcloud.beta.functions.deploy) ResponseError: status=[403], code=[Forbidden], message=[Permission denied on resource project bamboo-analyst-208008.]
```

...。どうやら`bamboo-analyst-208008`というプロジェクトが設定されていたらしい。
どのプロジェクトが設定されているか確認する。
`gcloud config list`コマンドにより、デフォルトの設定を確認する。ここで設定されている`project`を自分があっているか確認する。

``` sh
$ gcloud config list
[compute]
region = asia-northeast1
zone = asia-northeast1-c
[core]
account = **アカウントメールアドレス**
disable_usage_reporting = False
project = **プロジェクトID**

Your active configuration is: [default]
```

`gcloud config set project **プロジェクトID**`コマンドによりプロジェクトIDを指定する。

``` sh
$ gcloud config set project techblog-111111
Updated property [core/project].
```

## ERROR: (gcloud.beta.functions.deploy) Missing required argument [runtime]の原因と対応

さらに新しい関数をデプロイするには`--runtime`が必須と表示される。
``` sh
$ gcloud beta functions deploy helloGET --trigger-http
ERROR: (gcloud.beta.functions.deploy) Missing required argument [runtime]: Flag `--runtime` is required for new functions.
```

`--runtime`オプションに指定できる値は以下のとおり。

|オプション名|使える言語|
|:-|:-|
|nodejs6|Node.js 6|
|nodejs8|Node.js 8|
|nodejs10|Node.js 10(beta)|
|python37|Python 3.7|
|go111|Go 1.11|

さぁ、これで関数がデプロイできるぞ。
``` sh
$ gcloud beta functions deploy helloGET --trigger-http --runtime nodejs10
Deploying function (may take a while - up to 2 minutes)...done.
availableMemoryMb: 256
entryPoint: helloGET
httpsTrigger:
  url: https://us-central1-techblog-111111.cloudfunctions.net/helloGET
```

`curl`コマンドで`httpsTrigger`で指定されているURLをたたくと、`index.js`で書いておいた`Hello World!`が表示される。

``` sh
$ curl https://us-central1-techblog-111111.cloudfunctions.net/helloGET
Hello World!
```
