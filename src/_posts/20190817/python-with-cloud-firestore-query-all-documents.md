---
title: Cloud FirestoreからPython3.7でdocument一覧、subcollectionのdocument一覧を取得する
description: google-cloud-firestoreを使って、collectionのdocument一覧の取得、collectionのdocument一覧とsubcollectionのdocument一覧をまとめて取得、subcollectionを指定して、そのsubcollectionのdocument一覧を取得、親のcollectionをまたいでsubcollectionのdocument一覧を取得
date: 2019-08-17
categories:
  - Google Cloud
  - Python
tags:
  - Cloud Firestore
permalink: /python-with-cloud-firestore-query-all-documents
---
# {{ $page.title }}


<PostMeta/>

Cloud FirestoreをPython3.7から`google-cloud-firestore`を使ってデータを取得する。  
以下のデータ構造から一覧を取得する方法をまとめる。  
``` 
- rooms [collection]
    - name
    - messages [subcollection]
        - from
        - msg
```

## 認証情報を設定する
まずは認証情報を設定する。  
認証情報を設定しておかないと以下のようなエラーが表示される。  
``` sh
google.api_core.exceptions.ServiceUnavailable: 503 Getting metadata from plugin failed with error: ('invalid_grant: Not a valid email or user ID.', '{\n  "error": "invalid_grant",\n  "error_description": "Not a valid email or user ID."\n}')
```

Google Cloud Platformの画面で「APIとサービス」>「認証情報」>「認証情報を作成」>「サービスアカウントキー」から認証情報のJSONをダウンロードし、環境変数`GOOGLE_APPLICATION_CREDENTIALS`に設定する。  
``` sh
$ export GOOGLE_APPLICATION_CREDENTIALS="/Users/nancy/.config/gcloud/app-2c981dbdb83a.json"
```

## google-cloud-firestoreのインストールとデータの準備
Pythonから`firestore`へデータを追加したり参照したりするために、`google-cloud-firestore`をインストールする。  
``` sh
$ pipenv install google-cloud-firestore==1.4.0
$ pipenv shell
```

最初に示したデータ構造の初期データを用意する。  
`app.py`  
``` py
from google.cloud import firestore

db = firestore.Client()

# roomAのデータ準備
room_a_ref = db.collection('rooms').document('roomA')
room_a_ref.set({'name': '総合格闘技の対戦カードについて'})
message_ref = room_a_ref.collection('messages').document('message1')
message_ref.set({'from': 'nancy', 'msg': '試合いよいよ明日ですね!'})

message2_ref = room_a_ref.collection('messages').document('message2')
message2_ref.set({'from': 'kou', 'msg': 'たけぽんの出番やな'})

# roomBのデータ準備
room_b_ref = db.collection('rooms').document('roomB')
room_b_ref.set({'name': 'TWOのサトリCEOの今後'})
message_b_ref = room_b_ref.collection('messages').document('message1')
message_b_ref.set({'from': 'yamada', 'msg': 'サトリCEOは7ヶ国語はなせるらしいですよ。'})

message_b2__ref = room_b_ref.collection('messages').document('message2')
message_b2__ref.set({'from': 'take', 'msg': 'ほぇ〜そりゃすごい'})
```

## collectionのdocument一覧を取得する(subcollectionは含めない)  

``` py
rooms = db.collection('rooms')
docs = rooms.stream()
for doc in docs:
    print(docs)
    print(u'{} => {}'.format(doc.id, doc.to_dict()))
```

``` sh
$ python app.py 
roomA => {'name': '総合格闘技の対戦カードについて'}
roomB => {'name': 'TWOのサトリCEOの今後'}
```

## collectionのdocument一覧とsubcollectionのdocument一覧をまとめて取得する
これ、もっとスマートな方法あるのかな。  
わたしはループまわす方法しか見つけられなかったです...
`db.collection`で`CollectionReference`クラスが取得できる。  

・`CollectionReference`クラス  
`list_documents()`メソッドで`DocumentReference`クラスの一覧が取得できる。  
`stream()`メソッドで`DocumentSnapshot`クラスの一覧を取得できる。  
  
・`DocumentReference`クラス  
`get()`メソッドで`DocumentSnapshot`クラスが取得できる。これがデータ持ってる。  
`collection()`メソッドで`CollectionReference`クラスを取得できる。  

``` py
from google.cloud import firestore

db = firestore.Client()

rooms_ref = db.collection('rooms')
for doc_ref in rooms_ref.list_documents():
    doc = doc_ref.get()
    print('{} => {}'.format(doc.id, doc.to_dict()))

    messages_ref = doc_ref.collection('messages')
    for sub_doc in messages_ref.stream():
      print('{} => {}'.format(sub_doc.id, sub_doc.to_dict()))
```

``` sh
$ python app.py 
roomA => {'name': '総合格闘技の対戦カードについて'}
message1 => {'from': 'nancy', 'msg': '試合いよいよ明日ですね!'}
message2 => {'from': 'kou', 'msg': 'たけぽんの出番やな'}
roomB => {'name': 'TWOのサトリCEOの今後'}
message1 => {'from': 'yamada', 'msg': 'サトリCEOは7ヶ国語はなせるらしいですよ。'}
message2 => {'msg': 'ほぇ〜そりゃすごい', 'from': 'take'}
```

## subcollectionを指定して、そのsubcollectionのdocument一覧を取得する
親のcollectionから、document、subcollectinをたどれば取得できる。  

``` py
messages_ref = db.collection('rooms').document('roomA').collection('messages')
docs = messages_ref.stream()
for doc in docs:
    print(u'{} => {}'.format(doc.id, doc.to_dict()))
```

``` sh
$ python app.py 
message1 => {'from': 'nancy', 'msg': '試合いよいよ明日ですね!'}
message2 => {'from': 'kou', 'msg': 'たけぽんの出番やな'}
```

## 親のcollectionをまたいでsubcollectionのdocument一覧を取得する
`collection_group()`メソッドで取得できる。  

``` py
messages_ref = db.collection_group('messages')
docs = messages_ref.stream()
for doc in docs:
    print(u'{} => {}'.format(doc.id, doc.to_dict()))
```

``` sh
$ python app.py 
message1 => {'from': 'nancy', 'msg': '試合いよいよ明日ですね!'}
message2 => {'from': 'kou', 'msg': 'たけぽんの出番やな'}
message1 => {'from': 'yamada', 'msg': 'サトリCEOは7ヶ国語はなせるらしいですよ。'}
message2 => {'from': 'take', 'msg': 'ほぇ〜そりゃすごい'}
```

## 関連記事  
[Python3.7でCloud Firestoreを操作する](/python-with-cloud-firestore)  

## 参考
Data modelの説明  
https://cloud.google.com/firestore/docs/data-model  
  
サンプルコード  
https://github.com/GoogleCloudPlatform/python-docs-samples/blob/1625f8160939c5ead5951e2b15cd39f05ad585b5/firestore/cloud-client/snippets.py  
  
APIのドキュメント  
https://googleapis.github.io/google-cloud-python/latest/index.html  
