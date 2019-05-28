---
title: Cloud Pub/Subのエミュレーターを使ってローカル環境でPythonから操作する
description: Cloud Pub/Subのエミュレーターを使ってローカル環境でPythonから操作する
date: 2019-05-28
categories:
  - Google Cloud
tags:
  - Cloud Pub/Sub
permalink: /using-cloud-pub-sub-emulator
---

# {{ $page.title }}

<PostMeta/>

Cloud Pub/Subのエミュレーターを使ってローカル環境でPythonから操作する。  
なお、エミュレータは`gcloud pubsub`コマンドに**対応していない**。  
そのため、ローカルでPub/Subを確認するには必ずコードを書かなければならない。  

[[toc]]

## pubsub-emulatorをインストールする

`gcloud components list`で`pubsub-emulator`がインストール済みか確認する。  

``` sh
$ gcloud components list
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                                  Components                                                 │
├───────────────┬──────────────────────────────────────────────────────┬──────────────────────────┬───────────┤
│     Status    │                         Name                         │            ID            │    Size   │
├───────────────┼──────────────────────────────────────────────────────┼──────────────────────────┼───────────┤
...
│ Not Installed │ Cloud Pub/Sub Emulator                               │ pubsub-emulator          │  34.8 MiB │
...
└───────────────┴──────────────────────────────────────────────────────┴──────────────────────────┴───────────┘
```

インストール済みでない場合、次のコマンドで`pubsub-emulator`をインストールする。  
``` sh
$ gcloud components install pubsub-emulator
$ gcloud components update
```

アプリケーションがCloud Pub/Sub ではなくエミュレータに接続するように環境変数を設定する。  
`$(gcloud beta emulators pubsub env-init)`で`PUBSUB_EMULATOR_HOST`という環境変数が設定される。  
なお、エミュレータを起動するたびに、環境変数を設定する必要がある。  

``` sh
$ $(gcloud beta emulators pubsub env-init)
$ echo ${PUBSUB_EMULATOR_HOST}
localhost:8085
```

## PythonからCloud Pub/Subのエミュレーターを操作する
次の手順でCloud Pub/Subのエミュレーターを操作できる環境を作成する。  

### Pythonのgoogle-cloud-pubsubライブラリをpipenvでインストールする
pipenvのインストールと使い方はこちらの記事
[MacでPythonが動く環境を構築して、Flaskから文字列を返すところまで](/i-tried-beginning-in-python/#pipenvのインストール)に記載している。  

作業するディレクトリに空のPipfileを用意し、Python3.7が動く仮想環境を作成する。  
``` sh
$ touch Pipfile
$ pipenv install --python 3.7.3
```

Cloud Pub/SubのPythonライブラリをインストールする。  

``` sh
$ pipenv install google-cloud-pubsub==0.41.0
```

生成された`Pipfile`ファイルを確認すると、たしかに`google-cloud-pubsub`が入っている。  
``` py
[[source]]
name = "pypi"
url = "https://pypi.org/simple"
verify_ssl = true

[dev-packages]

[packages]
google-cloud-pubsub = "==0.41.0"

[requires]
python_version = "3.7"
```

### トピックの作成
`google.cloud`モジュールから`pubsub`オブジェクトをインポートする。  
`pubsub`オブジェクトから`PublisherClient`オブジェクトを取得する。  
`PublisherClient`オブジェクトの`topic_path`メソッドによりトピックのパスを作成する。  
`topic_path`メソッドの第一引数はプロジェクトID、第二引数はトピック名を指定する。  
そして、`PublisherClient`オブジェクトの`create_topic`メソッドによりトピックを作成する。

`create_topic.py`を作成する。  
``` py
from google.cloud import pubsub

project_id = 'using-pub-sub-emulator'
topic_name = 'my_topic'
client = pubsub.PublisherClient()
topic_path = client.topic_path(project_id, topic_name)
response = client.create_topic(topic_path)
print('Topic created: {}'.format(response))
```

``` sh
$ pipenv run python create_topic.py
Topic created: name: "projects/using-pub-sub-emulator/topics/my_topic"
```
  
トピックの一覧を取得するコードで、トピックが作成できたか確認する。  
`PublisherClient`オブジェクトの`project_path`メソッドでプロジェクトのパスを作成する。  
`project_path`メソッドの第一引数にはプロジェクトIDを指定する。`projects/using-pub-sub-emulator`のような値が返ってくる。  
`PublisherClient`オブジェクトの`list_topics`メソッドでトピックの一覧を取得する。
`list_topics`メソッドの第一引数はプロジェクトのパスを指定する。  

`confirm_topic.py`
``` py
from google.cloud import pubsub

project_id = 'using-pub-sub-emulator'
client = pubsub.PublisherClient()
project = client.project_path(project_id)
for element in client.list_topics(project):
  print(element)
```

`confirm_topic.py`を実行するとトピックのパスが確認できる。  
``` sh
$ pipenv run python confirm-topic.py
name: "projects/using-pub-sub-emulator/topics/my_topic"
```

### サブスクリプションの作成
`SubscriberClient`オブジェクトの`subscription_path`メソッドでサブスクリプションのパスを作成する。  
`project_path`メソッドの第一引数にはプロジェクトID、第二引数にはサブスクリプション名を指定する。`projects/using-pub-sub-emulator/subscriptions/my_subscription`のような値が返ってくる。  
`SubscriberClient`オブジェクトの`create_subscription`メソッドでサブスクリプションを作成する。  
`create_subscription`メソッドの第一引数にはサブスクリプションのパス、第二引数にはトピックのパスを指定する。

`create_subscription.py`
``` py
from google.cloud import pubsub

project_id = 'using-pub-sub-emulator'
topic_name = 'my_topic'
subscription_name = 'my_subscription'

publisher_client = pubsub.PublisherClient()
subscriber_client = pubsub.SubscriberClient()

topic_path = publisher_client.topic_path(project_id, topic_name)
subscription_path = subscriber_client.subscription_path(
    project_id, subscription_name)

response = subscriber_client.create_subscription(subscription_path, topic_path)
print('Subscription created: {}'.format(response))
```

`confirm_topic.py`を実行するとサブスクリプションのパスが確認できる。  
``` sh
$ pipenv run python create_subscription.py
Subscription created: name: "projects/using-pub-sub-emulator/subscriptions/my_subscription"
topic: "projects/using-pub-sub-emulator/topics/my_topic"
push_config {
}
ack_deadline_seconds: 10
message_retention_duration {
  seconds: 604800
}
```

### パブリッシャーはメッセージをトピックに登録する
`PublisherClient`オブジェクトの`publish`メソッドでメッセージをパブリッシュする。  
`publish`メソッドの第一引数はトピックのパス、キーワード引数dataにはメッセージのデータを指定する。  
メッセージのデータはUTF-8でエンコードしてバイナリにしておく。(`data.encode('utf-8')`)  

`publish-message.py`
``` py
from google.cloud import pubsub
import random

project_id = 'using-pub-sub-emulator'
topic_name = 'my_topic'
publisher = pubsub.PublisherClient()
topic_path = publisher.topic_path(project_id, topic_name)

for n in range(1, 10):
  data = 'メッセージです ランダムな数字 {}'.format(random.random())
  data = data.encode('utf-8')
  future = publisher.publish(topic_path, data=data)
  print('Published {} of message ID {}.'.format(data.decode(), future.result()))
```

`publish-message.py`を実行すると10個のメッセージがパブリッシュされる。  
``` sh
$ pipenv run python publish-message.py
Published メッセージです ランダムな数字 0.4473929581709073 of message ID 39.
Published メッセージです ランダムな数字 0.3743428720261527 of message ID 40.
Published メッセージです ランダムな数字 0.8932411308402567 of message ID 41.
Published メッセージです ランダムな数字 0.9453641446165716 of message ID 42.
Published メッセージです ランダムな数字 0.03304974995298049 of message ID 43.
Published メッセージです ランダムな数字 0.5652751880659433 of message ID 44.
Published メッセージです ランダムな数字 0.9222733287467317 of message ID 45.
Published メッセージです ランダムな数字 0.9817410397902789 of message ID 46.
Published メッセージです ランダムな数字 0.4486627053292169 of message ID 47.
```

### サブスクライバーはメッセージをサブスクリプションからpullで受け取る
メッセージを受け取る方法は同期、非同期の2種類がある。  
まずは同期的にpullする方法を見て、その次に非同期的にpullする方法を確認する。  

#### 同期でpullする
メッセージを同期にpullで受け取る。  
`SubscriberClient`オブジェクトの`pull`メソッドでメッセージを受け取る。  
pull`メソッドの第一引数はサブスクリプションのパス、キーワード引数max_messagesはこのリクエストで返されるメッセージの最大数を指定する。  
戻り値は`PullResponse`オブジェクトで、`received_messages`属性に受け取ったメッセージの配列が格納されている。メッセージがない場合は空の配列が返される。  

各メッセージは次のようにack_idとmessageが格納されており、メッセージのデータは`message.data`から取得できる。  

``` py
ack_id: "projects/using-pub-sub-emulator/subscriptions/my_subscription:11290"
message {
  data: "\343\203\241\343\203\203\343\202\273\343\203\274\343\202\270\343\201\247\343\201\231 \343\203\251\343\203\263\343\203\200\343\203\240\343\201\252\346\225\260\345\255\227 0.06807183426239971"
  message_id: "60"
  publish_time {
    seconds: 1559045847
  }
}
```

そして、`SubscriberClient`オブジェクトの`acknowledge`メソッドでメッセージの応答を返す。  
`acknowledge`メソッド第一引数はサブスクリプションのパス、第二引数は`ack_id`の配列を返す。  

`synchronous-pull.py`
``` py
from google.cloud import pubsub

project_id = 'using-pub-sub-emulator'
subscription_name = 'my_subscription'

subscriber = pubsub.SubscriberClient()
subscription_path = subscriber.subscription_path(
    project_id, subscription_name)

NUM_MESSAGES = 3

response = subscriber.pull(subscription_path, max_messages=NUM_MESSAGES)

ack_ids = []
for received_message in response.received_messages:
    print("Received: {}".format(received_message.message.data.decode()))
    ack_ids.append(received_message.ack_id)

subscriber.acknowledge(subscription_path, ack_ids)

print("Received and acknowledged {} messages. Done.".format(NUM_MESSAGES))
```

`synchronous-pull.py`を実行すると、`NUM_MESSAGES`で指定した数のメッセージを受け取ることができている。  
``` sh
$ pipenv run python synchronous-pull.py
Received: メッセージです ランダムな数字 0.06807183426239971
Received: メッセージです ランダムな数字 0.9155834358933995
Received: メッセージです ランダムな数字 0.5783843824115955
Received and acknowledged 3 messages. Done.
```

#### 非同期でpullする
メッセージを非同期にpullで受け取る。  
バックグラウンドで非同期にメッセージを処理できるようにするために、メインスレッドが終了しないようにする。`while True:
    time.sleep(60)`  
`SubscriberClient`オブジェクトの`subscribe`メソッドでメッセージを受け取る。  
`subscribe`メソッドの第一引数はサブスクリプションのパス、キーワード引数callbackはメッセージを受け取った際のコールバック関数を指定する。  
コールバック関数の引数は[`Message`](https://googleapis.github.io/google-cloud-python/latest/pubsub/subscriber/api/message.html)オブジェクトを受け取る。`data`属性にメッセージのデータが格納されており、`ack`メソッドでメッセージを受け取ったことを伝え、再度メッセージがこないようにする。  

`async-pull.py`
``` py
import time

from google.cloud import pubsub

project_id = 'using-pub-sub-emulator'
subscription_name = 'my_subscription'

subscriber = pubsub.SubscriberClient()
subscription_path = subscriber.subscription_path(
    project_id, subscription_name)


def callback(message):
    print('Received message: {}'.format(message.data.decode()))
    message.ack()


subscriber.subscribe(subscription_path, callback=callback)

print('Listening for messages on {}'.format(subscription_path))
while True:
    time.sleep(60)
```

・参考  
https://cloud.google.com/pubsub/docs/emulator  
https://googleapis.github.io/google-cloud-python/latest/pubsub/  
https://github.com/GoogleCloudPlatform/python-docs-samples/blob/master/pubsub/cloud-client/publisher.py  
https://github.com/GoogleCloudPlatform/python-docs-samples/blob/master/pubsub/cloud-client/subscriber.py  