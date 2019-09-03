---
title: Python3.7でtuple、namedtuple、list、dict、自作オブジェクトのforループ
description: ループさせる方法が型によって微妙に違うので、tuple、namedtuple、list、dict、自作オブジェクトのループの仕方をまとめた
date: 2019-09-03
categories:
  - Python
permalink: /python-loop-tuple-namedtuple-dict-list
---
# {{ $page.title }}


<PostMeta/>

ループさせる方法が型によって微妙に違うので、tuple、namedtuple、list、dict、自作オブジェクトのループの仕方をまとめた。

## tuple
### tupleの値をループする
そのまま`for 変数 in タプル`とすればループできる。  

``` py
tpl = ('hoge', 'fuga', 'piyo')
for t in tpl:
    print(t)
```

実行結果  
```
hoge
fuga
piyo
```

### tupleの値をインデックス付きでループする
`enumerate`関数でインデックス付きにしてループする。  

``` py
tpl = ('hoge', 'fuga', 'piyo')
for index, t in enumerate(tpl):
    print(index, t)
```

実行結果
``` py
0 hoge
1 fuga
2 piyo
```

## dict

### dictのプロパティ名をループする
そのまま`for 変数 in 辞書`とすると、プロパティ名だけループされる。  

``` py
dic = {'name': 'aya', 'age': 20, 'score': 56}
for d in dic:
    print(d)
```

実行結果
``` py
name
age
score
```

### dictの値をループする
`values()`メソッドで値の一覧をループすることができる。

``` py
dic = {'name': 'aya', 'age': 20, 'score': 56}
for d in dic.values():
    print(d)
```

実行結果
``` py
aya
20
56
```

### dictのプロパティ名と値をループする
プロパティ名とともに値も一緒にループしたい場合、`items()`メソッドを使ってループする。

``` py
dic = {'name': 'aya', 'age': 20, 'score': 56}
for name, value in dic.items():
    print(name, value)
```

実行結果
``` py
name aya
age 20
score 56
```

### dictのプロパティ名をインデックス付きでループする
`dict`の`items()`メソッドによりプロパティ名と値の一覧を取得した上で、`enumerate`関数によりインデックスをつけてループする。  

``` py
dic = {'name': 'aya', 'age': 20, 'score': 56}
for index, (name, value) in enumerate(dic.items()):
    print(index, name, value)
```

実行結果
``` py
0 name aya
1 age 20
2 score 56
```

## namedtupleで生成したオブジェクトのプロパティと値をループする
namedtupleで生成したオブジェクトのプロパティと値をforでループするには、`_asdict()`メソッドで`collections.OrderedDict`に変換したうえで、`items()`メソッドによりプロパティ名と値を取得する。  
なお、`dict`の取得は自作のオブジェクトと違い`vars()`関数が`vars() argument must have __dict__ attribute`とエラーになり使えない。

``` py
from collections import namedtuple

Person = namedtuple('Person', 'name age score')
nancy = Person('nancy', 18, 89)
or name, value in nancy._asdict().items():
    print(name, value)
```

実行結果  
``` py
name nancy
age 18
score 89
```

## 自作のオブジェクトのプロパティと値をループする
`vars()`関数で`dict`に変換してから`items`メソッドでループする。

``` py
class Todo:
    def __init__(self, name:str, done:bool):
      self.name = name
      self.done = done

t = Todo('牛乳を買う', False)

for name, value in vars(t).items():
    print(name, value)
```

実行結果
``` py
name 牛乳を買う
done False
```

## list

### オブジェクトのlistをループする
そのまま`for 変数 in リスト`とすればループできる。  

``` py
class Todo:
    def __init__(self, name:str, done:bool):
      self.name = name
      self.done = done

todos = [Todo('牛乳を買う', False), Todo('洗濯をする', True), Todo('ご飯をつくる', False)]

for t in todos:
  print(t.name, t.done)
```

実行結果
``` py
牛乳を買う False
洗濯をする True
ご飯をつくる False
```

### オブジェクトのlistをインデックス付きでループする
`enumerate`関数でインデックス付きにしてループする。  

``` py
class Todo:
    def __init__(self, name:str, done:bool):
      self.name = name
      self.done = done

todos = [Todo('牛乳を買う', False), Todo('洗濯をする', True), Todo('ご飯をつくる', False)]

for index, t in enumerate(todos):
  print(index, t.name, t.done)
```

## まとめ
- tupleとlistは何も考えずに`for 変数 in tupleかlist`でループできる
- dictはそのままループするとプロパティ名のみ、`values`メソッドで値のみ、`items`メソッドでプロパティと値をループできる
- index付きでループしたい場合は`enumerate`関数を使う
- namedtupleは`_asdict`メソッドでdictに変換してループする
- 自作のオブジェクトは`vars`関数でdictに変換してループする

## 参考  
https://stackoverflow.com/questions/33984333/looping-over-elements-of-named-tuple-in-python
  
https://stackoverflow.com/questions/36244380/enumerate-for-dictionary-in-python  