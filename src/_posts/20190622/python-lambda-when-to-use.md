---
title: Pythonのlambdaをsorted、map、filter、reduceを簡潔に書くために使う
description: Pythonのlambdaをsorted、map、filter、reduceを簡潔に書くために使う
date: 2019-06-22
categories:
  - Python
permalink: /python-lambda-when-to-use
---
# {{ $page.title }}


<PostMeta/>

Pythonの`lambda`キーワードをサンプルコードでよく見かけるので、使い方をまとめておく。  
どうやら`list`や`tuple`のような反復可能なオブジェクトの各要素に対して、並べ変えたり、絞り込んだりするときに簡潔に書くためにつかわれるようだ。  
  
Pythonのバージョンは3.7.3で試していく。  

## lambdaとは
Pythonにおいて関数は通常`def`キーワードを使い、関数名を指定して定義される。  
しかし、`lambda`キーワードを使うことで、関数名を指定せず関数(無名関数)を定義することができる。  
lambda関数の引数は0個でもよいし、カンマ区切りで複数とることもできるが、式は1つしか書けない。  
  
構文  
``` py
lambda 引数1, 引数2... : 式
```

### 引数が0個のlambda関数
引数は必須ではないため、必ず`True`を返す関数をつくることができる。(メリットはわからん...)

``` py
f = lambda: True
f() # True
```

### defで定義した関数とlambda関数
`def`で定義された引数二つを足し合わせる関数は、

``` py
def add(a, b):
    return a+b

print(add(1, 2)) # 3
```

`lambda`で書いた次のコードと同じ。  
``` py
add = lambda a, b: a+b

print(add(1, 2)) # 3
```

`lambda a, b: a+b`は関数を返し、`add`という変数に代入されている。  

## sortedで並べ換える
`sorted()`関数は`iterable`な一覧を並べ換える。  
組み込み関数の一つで、第一引数に`iterable`なオブジェクトをとる。キーワード引数の`key`の指定は任意で、引数が1つの関数を指定する。また、キーワード引数の`reverse`が`True`の場合、並べ替えは逆順になる。  

構文
``` py
sorted(iterable, key=None, reverse=False)
```

`['Pineapple', 'apple', 'banana', 'Kiwi']`という`list`を`sorted()`関数の引数に指定すると、大文字、小文字の順で並べ替えられ、その中でアルファベットに並べ替えられる。  
`reserve=True`を引数に追加すると逆順に並べ替えられる。  
`key=str.lower`として各要素を小文字で比較すると、大文字小文字関係なくアルファベット順に並び替えられる。

``` py
my_list = ['Pineapple', 'apple', 'banana', 'Kiwi']

print(sorted(my_list))  # ['Kiwi', 'Pineapple', 'apple', 'banana']

print(sorted(my_list, reverse=True)) # ['banana', 'apple', 'Pineapple', 'Kiwi']

print(sorted(my_list, key=str.lower)) # ['apple', 'banana', 'Kiwi', 'Pineapple']
```

## mapで関数を適用する
`map()`関数は`iterable`な一覧の各要素に同じ関数を適用する。  
組み込み関数の一つで、第一引数に`function`、第二引数に`iterable`なオブジェクトをとり、戻り値として`iterator`を返す。  iterableなオブジェクトの各要素に対して第一引数の関数を適用する。  
`list`を`map()`関数に渡して、戻り値として`list`を受け取るには、`list()`関数により`iterator`から`list`へ変換する必要がある。  

構文
``` py
map(function, iterable)
```

`list`の各要素に1を追加して`list`を受け取るには次のようにする。  

``` py
my_list = [5,3,1,2]

print(list(map(lambda x: x + 1, my_list))) # [6, 4, 2, 3]
```

## filterで絞り込む
`filter()`関数は`iterable`な一覧を絞り込む。  
組み込み関数の一つで、第一引数に`function`、第二引数に`iterable`なオブジェクトをとり、戻り値として`iterator`を返す。  iterableなオブジェクトの各要素に対して第一引数の関数が`True`になる要素に絞り込む。  

構文
``` py
filter(function, iterable)
```

`list`ないの要素の数が2より大きいものだけに絞り込むには次のようにする。  
``` py
my_list = [5, 3, 1, 2]

print(list(filter(lambda x: x > 2, my_list)))  # [5, 3]
```

## reduceで1つの値にまとめる
`reduce()`関数は`iterable`な一覧の各要素に関数を適用し、1つの値にまとめる。  
組み込み関数ではなく、functoolsモジュールにより提供されている。  
第一引数に`function`、第二引数に`iterable`なオブジェクトをとり、第三引数は任意で初期値を設定できる。この初期値は`iterable`なオブジェクトが空だった場合にそのまま返される。  

構文
``` py
functools.reduce(function, iterable[, initializer])
```

`list`が空の場合に初期値を設定していないと、`TypeError: reduce() of empty sequence with no initial value`というエラーが表示される。初期値を設定しておくと、その値が返されエラーにならない。  
`reduce()`関数を使うことで`[5, 3, 1, 2]`という`list`を足し合わせて合計値を出すことができる。  

``` py
import functools

my_list = []
print(functools.reduce(lambda total, current: total + current, my_list)) # TypeError: reduce() of empty sequence with no initial value
print(functools.reduce(lambda total, current: total + current, my_list, 0)) # 0

my_list = [5, 3, 1, 2]
print(functools.reduce(lambda total, current: total + current, my_list)) # 11
```

## 参考
https://docs.python.org/3/tutorial/controlflow.html?highlight=lambda#lambda-expressions  
https://docs.python.org/3/library/functions.html#sorted  
https://docs.python.org/3/library/functions.html#map  
https://docs.python.org/3/library/functions.html#filter  
https://docs.python.org/3/library/functions.html#func-list  
https://docs.python.org/3/library/functools.html#functools.reduce  
