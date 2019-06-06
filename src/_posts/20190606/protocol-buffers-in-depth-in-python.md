---
title: PythonでProtocol buffersのenumを操作する
description: Protocol buffersのenumを操作する。フィールド名を指定して値を取得、値からフィールド名を取得、フィールド名の一覧を取得、値の一覧を取得、フィールド名とペアの一覧を取得する。そして、enumへ値を設定する。
date: 2019-06-06
categories:
  - Python
tags:
  - Protocol Buffers
permalink: /protocol-buffers-enum-in-python
---

# {{ $page.title }}

<PostMeta/>

[PythonでProtocol Buffersを操作する](/protocol-buffers-in-python)記事で文字列や数値だけの簡単なデータ構造を扱った。この記事ではPythonでProtocol buffersのenumを扱いかたをみていく。  

[[toc]]

## protoファイルにenumを定義する
`proto`ファイルに次のような形式でenumを定義する。  
```
enum [enum名] {
  名前 = 値
  ...
}
```

> There must be a zero value, so that we can use 0 as a numeric default value.
The zero value needs to be the first element, for compatibility with the proto2 semantics where the first enum value is always the default.
https://developers.google.com/protocol-buffers/docs/proto3#enum

**1件目の値は必ず0**とする。  
2件目以降は32ビット整数の範囲内であれば好きな値を指定できる。  

次の`proto`ファイルは`Suit`というenum名で、`HEARTS`、`DIAMONDS`、`CLUBS`、`SPADES`を列挙型のメンバーの名前として定義し、それぞれの値を0から3まで連番でふっている。  
ここで定義した`Suit`というenumを`Request`というmessageで使用する。  
enumの定義は、メッセージの中にあってもよい。  その場合、他のメッセージのフィールドとしてそのenumを使うことはできない。  

`enum.proto`
``` proto
syntax = "proto3";

enum Suit {
  HEARTS = 0;
  DIAMONDS = 1;
  CLUBS = 2;
  SPADES = 3;
}

message Request {
  Suit suit = 1;
}
```

`protoc`コマンドでPythonのコードを出力する。  
``` sh
$ protoc --python_out=./ ./enum.proto
```

## Pythonからenumの値を取得する

まずはenumの値を取得する方法からみていく。  
出力されたモジュールをインポートする。  
定義したenumはフィールド名を指定して値を取得したり、その逆に値を指定してフィールド名を取得することができる。  
また、フィールド名の一覧、値の一覧、フィールド名と値のペアの一覧も取得できる。  

`use_enum.py`
``` py
import enum_pb2

# 値を取得する
print(enum_pb2.CLUBS == 2)  # True
print(enum_pb2.Suit.CLUBS == 2)  # True

# フィールド名から値を取得する
print(enum_pb2.Suit.Value('CLUBS')) # 2

# 値からフィールド名を取得する
print(enum_pb2.Suit.Name(2))  # CLUBS

# フィールド名の一覧を取得する
print(enum_pb2.Suit.keys())  # ['HEARTS', 'DIAMONDS', 'CLUBS', 'SPADES']

# 値の一覧を取得する
print(enum_pb2.Suit.values())  # [0, 1, 2, 3]

# フィールド名と値のペアを取得する
print(enum_pb2.Suit.items()) # [('HEARTS', 0), ('DIAMONDS', 1), ('CLUBS', 2), ('SPADES', 3)]
```

## Pythonからenumの値を設定する
メッセージにenumの値を設定するには、次のようにする。
ただし、`request.suit = enum_pb2.CLUBS`の部分は`request.suit = 2`と同じため型安全とは言えなそう。  
``` py
import enum_pb2

request = enum_pb2.Request()
request.suit = enum_pb2.CLUBS
print(request) # suit: DIAMONDS
```
