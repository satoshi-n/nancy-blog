## 繰り返し項目
リスト(list)や配列(array)のような繰り返し項目の定義方法をみていく。
protoファイルに次のような形式で繰り返し項目を定義する。
```
repeated [型名] [フィールド名] = [値]
```

`array.proto`
```
syntax = "proto3";

message Request {
  repeated string snippets = 1;
}
```


## オブジェクト(キーと値の組み合わせ)
## ネストされたタイプ
## Maps
## Any(自由な型)
## デフォルト値

## 1ファイルに複数のメッセージを定義する

・参考  
https://stackoverflow.com/questions/11502113/how-to-get-top-level-protobuf-enum-value-name-by-number-in-python  
https://github.com/protocolbuffers/protobuf/blob/master/python/google/protobuf/internal/enum_type_wrapper.py  