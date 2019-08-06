---
title: PythonでJSON文字列をdictに変換する
description: PythonでJSON文字列をdictに変換する
date: 2019-08-02
categories:
  - Python
permalink: /python-convert-json-string-to-dict
---
# {{ $page.title }}


<PostMeta/>

PythonでJSON文字列をdictに変換するには、Python 標準ライブラリの`json.loads(JSON文字列)`を使う。

ヒアドキュメント('''で複数業の文字列を囲む)によりJSON文字列を宣言し、`json.loads()`でdictに変換する。  
読み込んだものが文字列、数値に変換されていることを確認する。  

`json_test.py`
``` py
import json

json_string = '''
{
  "name": "nancy",
  "gender": "male",
  "age": 99
}
'''

json_dict = json.loads(json_string)
print(type(json_dict))
print(f"name:{json_dict['name']}, type:{type(json_dict['name'])}")
print(f"age:{json_dict['age']}, type:{type(json_dict['age'])}")
```

``` sh
$ python json_test.py
<class 'dict'>
name:nancy, type:<class 'str'>
age:99, type:<class 'int'>
```

もしJSON文字列が正しい形式でない場合、`json.decoder.JSONDecodeError`が発生する。  
したがって、エラーをハンドリングするにはtry/exceptで`json.loads`の処理をくくる必要がある。  

次のコードはJSON文字列から`,`を一つ少なくしているため、JSON文字列からdictへデコードできず、エラーになる。

``` py
import json

json_string = '''
{
  "name": "nancy"
  "gender": "male",
  "age": 99
}
'''
try:
  json_dict = json.loads(json_string)
  print(type(json_dict))
  print(f"name:{json_dict['name']}, type:{type(json_dict['name'])}")
  print(f"age:{json_dict['age']}, type:{type(json_dict['age'])}")
except json.decoder.JSONDecodeError as error:
  print(error)
```

``` sh
$ python json_test.py 
Expecting ',' delimiter: line 4 column 3 (char 23)
```