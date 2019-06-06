---
title: PythonでProtocol Buffersの文字列と数値の単純なメッセージを操作する
description: protobufをインストールし、.protoファイルからPythonのコードを生成する。そのコードを使ってシリアライズ、デシリアライズを試す。
date: 2019-06-02
categories:
  - Python
tags:
  - Protocol Buffers
permalink: /protocol-buffers-in-python
---

# {{ $page.title }}

<PostMeta/>

[gRPC](https://grpc.io/)のシリアライズのフォーマットとして使われる[Protocol Buffers](https://developers.google.com/protocol-buffers/)をさわってみる。  
protobufをインストールし、`.proto`ファイルからPythonのコードを生成する。そのコードを使ってシリアライズ、デシリアライズを試す。

[[toc]]

## Protocol Buffersとは
Protocol Buffersは、構造化されたデータをシリアライズする仕組みだ。  
構造化されたデータとは、値とその値がどんな意味をもつのか整理されたデータだ。  
シリアライズとは、プログラムで使われているメモリ内のオブジェクトを、ディスクに保存したりネットワーク経由で送信したりするためにバイトストリーム(一連のバイト列)に変換することだ。  

## Protocol Buffersを用いた開発
Protocol Buffersを用いた開発は次の手順で行なう。

1. `.proto`ファイルを作成する
2. `.proto`ファイルを指定した言語のコードへ変換(コンパイル)する
3. 変換されたコードを使い、オブジェクトをシリアライズおよびデシリアライズ(バイトストリームからオブジェクトへの変換)する

実際にファイルを作成しながら、1つずつ見ていく。  

## .protoファイルを作成する
`.proto`ファイルはコードを生成する元になるファイルだ。  
ファイルは[独自の構文](https://developers.google.com/protocol-buffers/docs/proto3)にしたがって記述していく。  
最初の行の`syntax`にはファイル内で使う構文のバージョンを記載する。指定しない場合`proto2`が使われる。2019/6/1時点では`proto3`が最新であるため、新しい構文を使いたい場合は明示的に指定する必要がある。  
コード中でオブジェクトと呼ばれているものは、`.proto`ファイルではメッセージと呼ばれている。  
メッセージを定義するには`message メッセージ名 {}`のように`message`という文言に続いてメッセージ名を定義する。  メッセージはフィールドごとに型、フィールド名、一意な番号をつける。  型は文字列を示す`string`や整数を示す`int32`だけでなく、浮動小数点を示す`float`や真偽値を示す`bool`が[用意されている](https://developers.google.com/protocol-buffers/docs/proto3#scalar)。

`person.proto`
```
syntax = "proto3";

message Person {
  string name = 1;
  int32 id = 2;
  string email = 3;
}
```

## .protoファイルを指定した言語のコードへ変換(コンパイル)する
作成した`.proto`ファイルをPythonのコードに変換するため、`protobuf`をインストールする。  
Macではbrewを使い`protobuf`をインストールする。  

``` sh
$ brew install protobuf
$ protoc --version
libprotoc 3.7.1
```

インストールした`protobuf`を使い、`.protoファイル`からPythonのコードを出力する。  
`protoc --python_out=[Pythonのコードを出力するディレクトリ] [.protoファイルのパス]`

``` sh
$ protoc --python_out=./ ./person.proto
```

Pythonのコードは、`.protoファイル`のファイル名に`_pb2`の接尾語がついたファイル名で出力される。  
``` sh
.
├── person.proto
└── person_pb2.py
```

## 変換されたコードを使い、オブジェクトをシリアライズおよびデシリアライズする
出力された`person_pb2.py`をインポートして、オブジェクトのシリアライズおよびデシリアライズを試していく。  

### オブジェクトをシリアライズする
`person_pb2`モジュールから`Person`クラスをインポートし、オブジェクトからバイナリー文字列を出力する`SerializeToString()`メソッドや、バイナリー文字列からオブジェクトを生成する`ParseFromString(data)`メソッドを持つオブジェクトを生成する。  

`main.py`
``` py
from person_pb2 import Person

person = Person()
person.id = 1234
person.name = "Jhon"
person.email = "jhon@example.com"
print(person.SerializeToString())
```

`main.py`をそのまま実行すると以下のエラーが表示される。  
`person_pb2`モジュールで読み込んでいる`Person`クラスで`google.protobuf`を読み込んでいるが、依存関係を解消していないためエラーになる。  

```
from google.protobuf import descriptor as _descriptor
ModuleNotFoundError: No module named 'google'
```

依存関係を解消するために`protobuf`を`pipenv`(`pip`)でインストールする。

``` sh
$ pipenv install protobuf
```

`protobuf`をインストールした上で実行すると、バイナリー文字列が出力される。  
``` sh
$ pipenv run python main.py
b'\n\x04Jhon\x10\xd2\t\x1a\x10jhon@example.com'
```

### バイナリーをデシリアライズする
`ParseFromString`でシリアライズ結果のバイナリー文字列を読み込む。  

``` py
from person_pb2 import Person

person = Person()
print('before', person)
person.ParseFromString(b'\n\x04Jhon\x10\xd2\t\x1a\x10jhon@example.com')
print('after', person)
```

実行するとバイト文字列からオブジェクトが生成されていることがわかる。  
``` sh
$ python read.py
before
after name: "Jhon"
id: 1234
email: "jhon@example.com"
```

・参考  
https://developers.google.com/protocol-buffers/  
https://developers.google.com/protocol-buffers/docs/pythontutorial  
https://stackoverflow.com/questions/633402/what-is-serialization  
