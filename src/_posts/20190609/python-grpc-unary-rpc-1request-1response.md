---
title: PythonでgRPCのUnary RPC(1リクエスト-1レスポンス)を実装する
description: PythonでgRPCのUnary RPC(1リクエスト-1レスポンス)を実装する
date: 2019-06-09
categories:
  - Python
tags:
  - gRPC
permalink: /python-grpc-unary-rpc-1request-1response
---
# {{ $page.title }}

<PostMeta/>

PythonでUnary RPCすなわち1リクエスト-1レスポンス形式のgRPCを実装してみる。  

[[toc]]

## gRPCとは
[gRPC](https://grpc.io/)とは、Remote Procedure Call (RPC) システムのことで、マイクロサービス間の通信を高速に、かつ簡易に記述することができる。  
gRPCには、gRPCクライアント(スタブ)とgRPCサーバの2つの役割がある。  
gRPCクライアントはgRPCサーバ上のメソッドを、まるでgRPCクライアントのローカルオブジェクトのメソッドを呼び出しているかのように扱うことができる。  
  
gRPCによる通信はサーバー間だけでなく、[gRPC-Web](https://github.com/grpc/grpc-web)対応のプロキシを経由することでブラウザ、サーバー間の通信にも使うことができる。  

## Unary RPC
gRPCクライアントがgRPCサーバのメソッドを呼び出す方法は4つあり、それぞれUnary RPC、Server streaming RPC、Client streaming RPC、Bidirectional streaming RPCと呼ばれている。  
この記事で実装するUnary RPCは、gRPCクライアントが**1つのリクエストに対して1つのレスポンスを受け取る**最もシンプルな通信方法だ。  

## PythonでUnary RPCを開発する手順

1. .protoファイルにサービスを定義する
2. grpcio-toolsを使用してメッセージおよびサーバとクライアントのコードを生成する
3. 生成されたコードを使ってサーバとクライアントのやりとりを実装する

protocol bufferをさわったことがない方は、protocol bufferのみをPythonで操作する記事
[PythonでProtocol Buffersの文字列と数値の単純なメッセージを操作する](/protocol-buffers-in-python)を書いているので参考にしていただけたらと思う。  

### .protoファイルにサービスを定義する
.protoファイルにサービス、リクエストのメッセージ、レスポンスのメッセージを定義する。  

サービスの定義は、`service`キーワードに続けてサービス名を指定する。  

```
service [サービス名] {
  // サービスのメソッド定義
}
```

サービスのメソッドは、サービスの`{}`内に記述していく。  
`rpc`キーワードに続きメソッド名を指定する。そして`()`内にリクエストのメッセージを指定し、`returns`キーワードに続き、`()`内にレスポンスのメッセージを指定する。  

```
rpc [メソッド名]([リクエストメッセージ]) returns ([レスポンスメッセージ]){
}
```

リクエストメッセージ、レスポンスメッセージは同じフォーマットで、`message`キーワードに続きメッセージ名を指定する。  メッセージ内の各フィールドは型名、フィールド名、番号を指定する。  

```
message [メッセージ名] {
  [型] [フィールド名] = [番号(基本的にはフィールドごとに1から連番)];
}
```

名前を渡したら、「こんにちは,　[name]」とメッセージを返すサービスを作成するには次のようにする。  
`proto`ファイルには`name`がリクエストとして送られてくること、そして、`message`をレスポンスとして返すことしか定義せず、サーバとクライアント間のインターフェースしか定義しない。  
実際のロジックは出力されたPythonコードを読み込んで別途実装する。  

`hello.proto`
```
syntax = "proto3";

package hello;

rpc HelloService {
  rpc SayHello (HelloRequest) returns (HelloReply) {}
}

message HelloRequest {
  string name = 1;
}

message HelloReply {
  string message = 1;
}
```

### grpcio-toolsを使用してメッセージおよびサーバとクライアントのコードを生成する
コードを生成するために、pipenv(あるいはpip)で`grpcio`と`grpcio-tools`をインストールする。

``` sh
$ touch Pipfile
$ ipenv install --python 3.7.3
$ pipenv install grpcio
$ pipenv install --dev grpcio-tools
```

`pipenv graph`コマンドでインストールしたバージョンを確認する。  

``` sh
$ pipenv graph
grpcio-tools==1.21.1
  - grpcio [required: >=1.21.1, installed: 1.21.1]
    - six [required: >=1.5.2, installed: 1.12.0]
  - protobuf [required: >=3.5.0.post1, installed: 3.8.0]
    - setuptools [required: Any, installed: 41.0.1]
    - six [required: >=1.9, installed: 1.12.0]
```

`grpcio`は`1.21.1`、`grpcio-tools`も同じく`1.21.1`をインストールしている。  
また`grpcio-tools`と依存関係のある`protobuf`は`3.8.0`がインストールされている。  
`protobuf`は`.proto`ファイルからメッセージのみを出力するが、それに対して`grpcio-tools`は`.proto`ファイルからメッセージだけではなくクライアント、サーバーも生成する。  

次のようなディレクトリ下で`.proto`ファイルからPythonのコードを生成する。  
``` sh
.
├── Pipfile
├── Pipfile.lock
└── hello.proto
```

`.proto`ファイルからPythonのコードを生成するためのコマンドは次の通り。  
`python -m grpc.tools.protoc `に続けて以下の項目を指定する。  
`-I`でprotoファイルが格納されているディレクトリを指定する。`--python_out`で`_pb2.py`がつくファイルを出力するディレクトリを指定する。`--grpc_python_out`で`_pb2_grpc.py`がつくファイルを出力するディレクトリを指定する。最後に`protoファイル`のパスを指定する。  

``` sh
python -m grpc.tools.protoc -I[protoファイルが格納されているディレクトリ] --python_out=[_pb2.pyがつくファイルを出力するディレクトリ] --grpc_python_out=[_pb2_grpc.pyがつくファイルを出力するディレクトリ] [protoファイル]
```

`hello.proto`ファイルを入力として、すべてカレントディレクトリに出力する場合は以下の通りにコマンドを実行する。  
``` sh
$ pipenv shell
$ python -m grpc.tools.protoc -I. --python_out=. --grpc_python_out=. ./hello.proto
```

コマンドを実行すると、`hello_pb2.py`と`hello_pb2_grpc.py`が出力される。  
``` sh{5,6}
.
├── Pipfile
├── Pipfile.lock
├── hello.proto
├── hello_pb2.py
└── hello_pb2_grpc.py
```

`hello_pb2.py`にはリクエスト、およびレスポンスメッセージのクラスが含まれており、`hello_pb2_grpc.py`にはクライアントおよびサーバのクラスが含まれている。  

### 生成されたコードを使ってサーバとクライアントのやりとりを実装する
生成されたコードをインポートしてサーバとクライアントのコードを実装する。  
まずはサーバのコードを実装する。  
`[サービス名]Servicer`を継承したクラスを作成し、サーバのメソッドを実装する。  
`SayHello`メソッドの第二引数の`request`は`HelloRequest`として定義したメッセージを受け取ることができる。  そして、戻り値は`HelloReply`メッセージを返すようにする。  

`hello_server.py`
``` py
import hello_pb2
import hello_pb2_grpc

class HelloService(hello_pb2_grpc.HelloServiceServicer):
    def SayHello(self, request, context):
        return hello_pb2.HelloReply(message=f'こんにちは, {request.name}')
```

以下のコードを参考にgrpcサーバを立ち上げる部分を実装する。  
https://github.com/grpc/grpc/blob/master/examples/python/helloworld/greeter_server.py  
``` py
from concurrent import futures
import time

import grpc

_ONE_DAY_IN_SECONDS = 60 * 60 * 24

def serve():
    server = grpc.server(futures.ThreadPoolExecutor(max_workers=10))
    hello_pb2_grpc.add_HelloServiceServicer_to_server(HelloService(), server)
    server.add_insecure_port('[::]:50051')
    server.start()
    try:
        while True:
            time.sleep(_ONE_DAY_IN_SECONDS)
    except KeyboardInterrupt:
        server.stop(0)


if __name__ == '__main__':
    serve()
```

次にクライアント側のコードを実装する。  
サーバと同じように以下のコードを参考にgrpcサーバを立ち上げる部分を実装する。  
https://github.com/grpc/grpc/blob/master/examples/python/helloworld/greeter_client.py  
`HelloServiceStub`のgRPCクライアント(スタブ)からメソッドを呼び出す。  
リクエスト時は`HelloRequest`メッセージを指定する。  

`hello_client.py`
``` py
import grpc

import hello_pb2
import hello_pb2_grpc


def run():
    with grpc.insecure_channel('localhost:50051') as channel:
        stub = hello_pb2_grpc.HelloServiceStub(channel)
        response = stub.SayHello(hello_pb2.HelloRequest(name='なんしー'))
        print("client received: " + response.message)


if __name__ == '__main__':
    run()
```

サーバー、クライアントのコードをそれぞれ別のターミナルで立ち上げる。  
``` sh
$ python hello_server.py
```

クライアントのコードを実行すると、gRPCサーバーからメッセージを受け取っていることが確認できる。  

``` sh
$ $ python hello_client.py
client received: こんにちは, なんしー
```

・参考  
https://grpc.io/docs/guides/concepts/  
