---
title: FlaskをCloud Runで動かす
description: FlaskのDockerイメージをマルチステージビルドで作成しCloud Runにデプロイする
date: 2020-09-02
categories:
  - Google Cloud
  - Python
tags:
  - Cloud Run
permalink: /cloud-run-with-flask-and-pipenv
---
# {{ $page.title }}

<PostMeta/>

Flaskのコードを実行時のみの課金、そして自動でスケールする環境へ楽にデプロイしたかったので、[Cloud Run](https://cloud.google.com/run?hl=ja)を使うことにした。  
公式サイトにも手順はのっているのだけど、ローカルで動作確認をして、Dockerイメージをマルチステージビルドで作成し、アジアのデータセンター(asia.gcr.io)にデプロイしたかったので試した。  

## Cloud Runとは
Cloud RunはDockerで開発したWebアプリケーションを簡単に公開できるサービスだ。  
[Compute Engine](https://cloud.google.com/compute/?hl=ja)のようにCentOSやUbuntuの設定をする必要はなく、Cloud Runの設定をしてDockerイメージをリポジトリにpushするだけで簡易にデプロイできる。  

## Cloud Runの制約
Cloud Runを使ってWebアプリケーションを作る上で気になる制約を見ておく。  
タイムアウト、リクエストとレスポンスの最大サイズ、メモリの制約だ。  
Cloud Run（フルマネージド）のデフォルトのタイムアウトは5分、最大タイムアウトは 15 分だ。  
リクエスト、レスポンスの最大サイズは32MB、メモリの最大サイズは2GBだ。

## ローカル開発
それでは、早速ローカルでの開発を進めていく。  
FlaskでWebアプリケーションを作成して、/にアクセスしたら`Hell World`と返ってくるようにする。  

まずは使いたいバージョンのPythonを設定する。  

``` sh
$ touch Pipfile
$ pipenv --python 3.8.3
```

`Flask`と`gunicorn`をインストールする。  
``` sh
$ pipenv install Flask==1.1.2 gunicorn==20.0.4
```

お試しのアプリケーションを作成する。  
ポイントは`host="0.0.0.0"`とすること、そしてポートを`port=int(os.environ.get("PORT", 8080))`のように環境変数で設定できるようにすることだ。  
> The container must listen for requests on 0.0.0.0 on the port to which requests are sent. By default, requests are sent to 8080, but you can configure Cloud Run to send requests to the port of your choice.
> https://cloud.google.com/run/docs/reference/container-contract

`app.py`
``` py
import os

from flask import Flask

app = Flask(__name__)


@app.route("/")
def hello_world():
    return "Hello World"


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
```

Webサーバーを立ち上げる。  
``` sh
$ pipenv shell
$ gunicorn --bind :8080 --workers 1 --threads 8 --timeout 0 app:app
```

`/`にアクセスすると`Hell World`が返ってくる。  

``` sh
$ curl http://localhost:8080/
Hello World
```

## Docker作成

Dockerに含めないファイルを`.dockerignore`に追加する。  
``` 
Dockerfile
README.md
*.pyc
*.pyo
*.pyd
__pycache__
.venv
.mypy_cache
```

`Dockerfile`を作成する。

``` docker
FROM python:3.8-buster as base

WORKDIR /opt/app
COPY Pipfile Pipfile.lock /opt/app/
RUN pip install pipenv \
  && pipenv install --ignore-pipfile --deploy --system


FROM python:3.8-slim-buster as prod

COPY --from=base /usr/local/lib/python3.8/site-packages /usr/local/lib/python3.8/site-packages
COPY --from=base /usr/local/bin/gunicorn /usr/local/bin/gunicorn

WORKDIR /opt/app
COPY . /opt/app

CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
```

Pipfile.lockから依存関係を解決するために`--ignore-pipfile`、Pipfile.lockの依存関係を更新しないようにするために`--deploy`、仮想環境を作らず依存関係をインストールするために`--system`をそれぞれ指定する。  

ディレクトリは以下のようになる。  
``` sh
├── .dockerignore
├── Dockerfile
├── Pipfile
├── Pipfile.lock
└── app.py
```

Cloud RunにデプロイするためにコンテナイメージをContainer Registryにアップロードする。  
その際、タグ名は以下のようにする。  

> [HOSTNAME]/[PROJECT-ID]/[IMAGE]
> https://cloud.google.com/container-registry/docs/pushing-and-pulling?hl=ja#push_the_tagged_image_to

HOSTNAMEはアジアのデータセンター`asia.gcr.io`とし、
PROJECT-IDは`gcloud config get-value project`で確認しておく。  
IMAGEは任意なので`helloworld`としている。  
  
コンテナイメージを構築し、コンテナの環境変数を`-e 環境変数名=値`、公開ポートを`-p ホスト側ポート:コンテナ側ポート`としてFlaskのWebアプリケーションを起動する。  

``` sh
$ docker build -t asia.gcr.io/プロジェクトID/helloworld .
$ docker run -e PORT=9000 -p 9000:9000 asia.gcr.io/[PROJECT-ID]/helloworld:latest
```

`/`にアクセスすると`Hell World`が返ってくる。  
``` sh
$ curl http://localhost:9000/
Hello World
```

これでローカル環境でDockerの確認ができた。  　
次はCloud Runにデプロイする。  

## デプロイ
すでにビルドは行なっているため、`docker push`でイメージをpushする。  

``` sh
$ docker push asia.gcr.io/[PROJECT-ID]/helloworld:latest
```

ビルドも一緒に行いたい場合は`gcloud builds submit`でpushする。  

``` sh
$ gcloud builds submit --tag asia.gcr.io/[PROJECT-ID]/helloworld:latest .
```

そして、`gcloud run deploy`でCloud Runにデプロイする。  
なお、大阪リージョン`asia-northeast2`はカスタムドメインを指定できない。  
  
> asia-northeast2、australia-southeast1、northamerica-northeast1 では、カスタム ドメインを Cloud Run（フルマネージド）サービスにマッピングできません。
> https://cloud.google.com/run/docs/mapping-custom-domains?hl=ja

``` sh
$ gcloud run deploy --image asia.gcr.io/[PROJECT-ID]/helloworld:latest --platform managed --region asia-northeast1
Service name (helloworld):  
Allow unauthenticated invocations to [helloworld] (y/N)?  y
...
Service [helloworld] revision [helloworld-00001-cug] has been deployed and is serving 100 percent of traffic at https://helloworld-lcp6rszgfa-an.a.run.app
```

Service nameはデフォルトのままとし、未認証の呼び出しを許可する。  
すると、`https://helloworld-lcp6rszgfa-an.a.run.app`のようにURLが表示される。

アクセスしてみると、`Hello World`と表示される。  
素晴らしい。  
``` sh
$ curl https://helloworld-lcp6rszgfa-an.a.run.app
Hello World
```

## 後始末

`gcloud beta run services list`でサービス名を確認し、`gcloud beta run services delete [サービス名]`でCloud RunでデプロイしたWebアプリケーションを削除する。  

``` sh
$ gcloud beta run services list --platform managed --region asia-northeast1
   SERVICE     REGION           URL                                         LAST DEPLOYED BY      LAST DEPLOYED AT
✔  helloworld  asia-northeast1  https://helloworld-lcp6rszgfa-an.a.run.app  メールアドレス  2020-08-30T08:47:33.333163Z

$ gcloud beta run services delete helloworld --platform managed --region asia-northeast1
```

参考  
https://cloud.google.com/run/docs/configuring/request-timeout?hl=ja  
https://cloud.google.com/run/quotas?hl=ja  
https://cloud.google.com/run/docs/quickstarts/build-and-deploy?hl=ja  
https://cloud.google.com/container-registry/docs/pushing-and-pulling?hl=ja  
https://future-architect.github.io/articles/20200513/  
https://stackoverflow.com/questions/52922688/pipenv-sync-and-pipenv-install-system-ignore-pipfile-in-docker-environment  
