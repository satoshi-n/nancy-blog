---
title: Python3.7でCloud Firestoreを操作する
description: Google Cloudにプロジェクトを追加し、Pythonのライブラリgoogle-cloud-firestoreでCloud Firestoreでのドキュメントの追加、参照、変更、削除する方法をみていく
date: 2019-05-18
categories:
  - Google Cloud
  - Python
tags:
  - Cloud Firestore
permalink: /python-with-cloud-firestore
---

# {{ $page.title }}

<PostMeta/>

Google Cloudにプロジェクトを追加し、PythonのCloud Firestoreを操作するライブラリ`google-cloud-firestore`でCloud Firestoreでのドキュメントの追加、参照、変更、削除する方法をみていく。

[[toc]]

## Cloud Firestoreとは
Cloud Firestoreは、Cloud Datastoreの後継で、Google Cloudが提供しているフルマネージドのNoSQLだ。  

## 準備
前提として、Cloud FirestoreはCloud Datastoreと同じプロジェクトで使うことができない。  
> Cloud Firestore and App Engine: You can't use both Cloud Firestore and Cloud Datastore in the same project, which might affect apps using App Engine. 
https://cloud.google.com/firestore/docs/quickstart-servers?hl=ja

### プロジェクトの作成
`gcloud projects create プロジェクト名`でプロジェクトを作成する。  

``` sh
$ gcloud projects create gae-firestore-app
```

### gcloudコマンド実行時のプロジェクト
`gcloud`のコマンド実行時はオプションなしの場合、デフォルトのプロジェクトに対して操作を行う。  
`gcloud`に`--project=[プロジェクトID]`オプションをつけることで、デフォルトのプロジェクト以外を操作できる。  
  
なお、デフォルトのプロジェクトは変更できるので、`gcloud config set project [プロジェクトID]`で変更してもよい。その場合、`gcloud`コマンド実行時に`--project=[プロジェクトID]`オプションは不要になる。  
``` sh
$ gcloud config set project gae-firestore-app
```

### サービスアカウント作成
Cloud DatastoreをPythonで操作する際に、操作する権限をもっていることを示す必要があるため、キーファイルが必要になる。そのキーファイルをつくるために、サービスアカウントを作成する。  

次のコマンドでサービスアカウントを作成する。  
`gcloud iam service-accounts create [サービスアカウント名]`

``` sh
$ gcloud iam service-accounts create firestore-service-account --project=gae-firestore-app
Created service account [firestore-service-account].
```

### サービスアカウントへ権限を付与する

次のコマンドでサービスアカウントへ権限を付与する。
`gcloud projects add-iam-policy-binding [プロジェクトID] --member "serviceAccount:[サービスアカウント名]名@[プロジェクトID].iam.gserviceaccount.com" --role [ロール]`

``` sh
$ gcloud projects add-iam-policy-binding gae-firestore-app --member "serviceAccount:firestore-service-account@gae-firestore-app.iam.gserviceaccount.com" --role "roles/owner" --project=gae-firestore-app
Updated IAM policy for project [gae-firestore-app].
```

### キーファイルを生成する

次のコマンドでキーファイルを生成する。  
`gcloud iam service-accounts keys create [キーファイル名].json --iam-account [サービスアカウント名]@[プロジェクトID].iam.gserviceaccount.com`

コマンドを実行すると、ローカルにコマンド実行時に指定したキーファイル名のJSONファイルが出来上がる。  このJSONファイルを確認すると、プロジェクトIDや秘密鍵、サービスアカウントのメールアドレスなどが格納されている。  

``` sh
$ gcloud iam service-accounts keys create service-account.json --iam-account firestore-service-account@gae-firestore-app.iam.gserviceaccount.com
created key [e3e79611a383c1c144cf8dee5812a0b490f5d738] of type [json] as [service-account.json] for [firestore-service-account@gae-firestore-app.iam.gserviceaccount.com]
$ ls -l service-account.json
-rw-------  1 nancy  staff  2356  5 14 21:28 service-account.json
$ cat service-account.json
{
  "type": "service_account",
  "project_id": "gae-firestore-app",
  "private_key_id": "xxx",
  "private_key": "-----BEGIN PRIVATE KEY-----yyy-----END PRIVATE KEY-----\n",
  "client_email": "firestore-service-account@gae-firestore-app.iam.gserviceaccount.com",
  "client_id": "zzz",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firestore-service-account%40gae-firestore-app.iam.gserviceaccount.com"
}
```

### PythonからCloud Firestoreへ接続する
PythonからCloud Firestoreを操作できるようにするため、`google-cloud-firestore`をインストールする。

``` sh
$ pipenv install google-cloud-firestore==1.1.0
```

`service-account.json`と同じ階層に、Cloud Firestoreを操作するPythonファイル(`use-cloud-firestore.py`)を用意する。

`firestore.Client().from_service_account_json([Cloud Firestoreへの編集権限があるキーファイル名])`を指定して、Cloud Firestoreへ接続する。  

`use-cloud-firestore.py`
``` py
from google.cloud import firestore

db = firestore.Client().from_service_account_json('service-account.json')
print(db)
```

Visual Studio Codeでデバッグして動かしてみると、`from_service_account_json()`メソッドで取得したオブジェクトに、Cloud Firestoreを操作できそうなものが入っていることがわかる👀  
![dbに入っているもの](./firestore-obj.png)

## 操作
それでは、実際にPythonからCloud Firestoreへ接続して、追加、参照、変更、削除を試していく。  

### 追加
Google Cloud PlatformのコンソールでFirestoreが空であることを確認する。
![consoleでFirestoreが空であることを確認する](./console-firestore.png)

`db.collection(コレクションのパス).document(ドキュメントのパス)`でドキュメントへの参照を取得し、`set()`メソッドでデータを追加する。

``` py
from google.cloud import firestore

db = firestore.Client().from_service_account_json('service-account.json')

doc_ref = db.collection('users').document('masaru-hanada')
doc_ref.set({
    'first': 'まさる',
    'last': 'はなだ',
    'born': 1986
})

doc_ref = db.collection('users').document('hanako-kato')
doc_ref.set({
    'first': 'はなこ',
    'last': 'かとう',
    'born': 1934
})
```

上記のPython実行後に再度コンソールを確認すると、`set`した内容が表示されている。
![追加されてる](./setted.png)

### 参照
一覧、1件の取得それぞれを見ていく。  

#### 一覧の参照
コレクションのパスを指定してドキュメントの一覧を取得する方法をみていく。 
`CollectionReference`に対して`get`しようとすると、廃止予定だから`stream`を使えと表示される。  

``` py
'Collection.get' is deprecated:  please use 'Collection.stream' instead.
```

`CollectionReference`に対して`stream()`メソッドを使い`Document`の一覧を取得し、ループする。  
各フィールドは`DocumentSnapshot`に対して`get(フィールド名)`で取得する。  

`CollectionReference`の`stream()`メソッド取得できるものは、あんまり理解できてないが、ドキュメントをfor文で回せるもの、と理解しておく。  
  
何に対して操作しているのかわかりづらかったので、下記モジュール中の変数名とオブジェクトの対比表を書いた。  

| 下記モジュール中の変数名 | オブジェクト | 概要 |
----|---- |---- 
| db | [google.cloud.firestore_v1.client.Client](https://googleapis.github.io/google-cloud-python/latest/firestore/client.html) | Google Cloudを操作するためのクライアント |
| user_ref | [google.cloud.firestore_v1.collection.CollectionReference](https://googleapis.github.io/google-cloud-python/latest/firestore/collection.html) | コレクション |
| docs | generator object Query.stream(これはオブジェクトてくくりだと変かも) | ドキュメントの一覧 |
| doc | [google.cloud.firestore_v1.document.DocumentSnapshot](https://googleapis.github.io/google-cloud-python/latest/firestore/document.html) | ドキュメントのスナップショット |

``` py
from google.cloud import firestore

db = firestore.Client().from_service_account_json('service-account.json')

user_ref = db.collection('users')
docs = user_ref.stream()
for doc in docs:
    print('姓:{} 名:{} 生まれ年:{}'.format(
        doc.get('last'), doc.get('first'), doc.get('born')))
```

#### 1件の参照
ドキュメントのパスを指定して1件だけ取得する方法を見ていく。
`CollectionReference`の`document`メソッドで取得できるのは`google.cloud.firestore_v1.document.DocumentReference`だ。`DocumentReference`に対して`get()`メソッドを実行することで、`DocumentSnapshot`が取得できる。  

``` py
from google.cloud import firestore

db = firestore.Client().from_service_account_json('service-account.json')

user_ref = db.collection('users').document('hanako-kato')
snapshot = user_ref.get()
print(snapshot.to_dict())
```

### 変更
`db.collection(コレクションのパス).document(ドキュメントのパス)`でドキュメントへの参照を取得し、`update()`メソッドでデータを更新する。

``` py
from google.cloud import firestore

db = firestore.Client().from_service_account_json('service-account.json')

user_ref = db.collection('users').document('hanako-kato')
user_ref.update({'born': 1990})
```

### 削除
`db.collection(コレクションのパス).document(ドキュメントのパス)`でドキュメントへの参照を取得し、`delete()`メソッドでドキュメントを削除できる。

``` py
from google.cloud import firestore

db = firestore.Client().from_service_account_json('service-account.json')

user_ref = db.collection('users').document('hanako-kato')
user_ref.delete()
```

・参考  
https://cloud.google.com/firestore/?hl=ja  
https://cloud.google.com/firestore/docs/quickstart-servers  
https://github.com/GoogleCloudPlatform/python-docs-samples/blob/b20c339fadd62543bc74ce7fe07ded47c6e6c6c0/firestore/cloud-client/snippets.py#L36-L41  
https://googleapis.github.io/google-cloud-python/latest/firestore/index.html  
https://github.com/googleapis/google-cloud-python/tree/master/firestore  