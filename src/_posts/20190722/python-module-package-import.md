---
title: Python3のimportパターン13個
description: Python3のimportで使いそうなものを13パターン、コード付きで紹介する。
date: 2019-07-22
categories:
  - Python
permalink: /python-module-package-import
---
# {{ $page.title }}

<PostMeta/>

Pythonで意味のある単位にファイルを分割してWebアプリケーションを作成したい。  
どうやら、Pythonにはあるファイルから他のファイルを読み込む際のパターンが複数あるようなので、まとめておく。  

## Pythonにexportはない
Pythonにおいてあるファイルから他のファイルを読み込む場合、関数やオブジェクトを提供するファイルに`export`のような記述をする**必要はない**。  
したがって、読み込む方法だけ確認しておけば、ファイルを意味のある単位に分割して開発していける。   

## 読み込みのパターン
MECE(漏れなくダブりなく)じゃないけど、読み込みのパターンはおおよそ以下の通り。  

1. import モジュール
2. import モジュール as モジュールの別名
3. from モジュール import 変数、関数、クラス、モジュール
4. from モジュール import 変数、関数、クラス、モジュール as 別名
5. from モジュール import *
6. from パッケージ.モジュール import 変数、関数、クラス、モジュール  (子ディレクトリから読み込む)
7. from . import 変数、関数、クラス、モジュール  (相対importで同じディレクトリから読み込む)
8. from .. import 変数、関数、クラス、モジュール  (相対importで親ディレクトリから読み込む)
9. from ..パッケージ import 変数、関数、クラス、モジュール  (相対importで兄弟ディレクトリから読み込む)
10. import 標準ライブラリ(`sys`や`math`、`datetime`など)
11. import サードパーティライブラリ(`flask`や`numpy`など)
12. sys.pathによる検索モジュールの追加 + from 親モジュール  (attempted relative import beyond top-level packageの対応)
13. 環境変数PYTHONPATHでモジュール検索パスを追加

## 用語整理
### モジュールとは
Pythonでは変数や関数、クラスなどを書いたファイルを**モジュール**と呼ぶ。  

### パッケージとは
Pythonにおけるパッケージはほぼディレクトリ。(厳密には違うらしい)  
パッケージは特別なモジュールの一種である。パッケージは通常のモジュールとは違い`__path__`属性を持つ。
パッケージは**階層構造をなし、複数のモジュールおよび、サブパッケージをもつ**ことができる。  
パッケージの種類は「通常のパッケージ」と「名前空間パッケージ」の2つである。
「通常のパッケージ」はディレクトリに`__init__.py`ファイルがある。一方で、「名前空間パッケージ」のディレクトリには`__init__.py`がない。なお、「名前空間パッケージ」はPython 3.3から導入された概念である。  

### 標準ライブラリとは
Pythonの標準ライブラリには組み込み関数やデータ型、システム、ファイルIOなど汎用的なモジュールが含まれる。  
通常のPythonインストーラによりPythonをインストールすると、標準ライブラリも一緒にインストールされる。  

### サードパーティライブラリとは
この記事ではFlaskやDjangoのようなフレームワークやNumPyのような計算を行うためのパッケージなど第三者によってPyPIに公開されているパッケージのことサードパーティライブラリと呼ぶ。  

## 1. import モジュール
`import モジュール`の形式で変数、関数、クラスを読み込む。

ディレクトリ構成
``` sh
.
├── hello.py
└── main.py
```

`hello.py`　読み込まれるファイル
``` py
val = 100


def hello():
    return 'hello'


class Cls:
    def __init__(self, prop):
        self.prop = prop
```

`main.py` 読み込むファイル
``` py
import hello

# 変数のimport
print(hello.val)
# 関数のimport
print(hello.hello())
# クラスのimport
print(vars(hello.Cls('こんにちは')))
```

main.pyを実行すると変数、関数、クラスが読み込まれていることがわかる。  
``` sh
$ main.py
100
hello
{'prop': 'こんにちは'}
```

## 2. import モジュール as モジュールの別名
`import モジュール as モジュールの別名`の形式でファイル内で`モジュールの別名.変数`、`モジュールの別名.関数`、`
`モジュールの別名.クラス`のように別名でアクセスできる。  

以下の内容で1. import モジュールと同じ出力結果を得られる。  
`main.py`  
``` py
import hello as he
print(he.val)
print(he.hello())
print(vars(he.Cls('こんにちは')))
```

## 3. from モジュール import 変数、関数、クラス、モジュール
変数、関数、クラスだけでなくモジュールもimportできることを確認するため、モジュールを追加する。

ディレクトリ構成  
``` sh
.
├── goodnight.py
├── hello.py
└── main.py
```

`goodnight.py`
``` py
gn = 'Good night!'
```

`hello.py`
``` py
import goodnight
# 以下略
```

毎回`モジュール.変数`や`モジュール.関数`のようにすることなく、直接変数や関数、クラスを使うことができる。  
また、モジュールも読み込むことができている。  

`main.py`
``` py
from hello import val
from hello import hello
from hello import Cls
from hello import goodnight

print(val)
print(hello())
print(vars(Cls('こんにちは')))
print(goodnight)
```

``` sh
$ main.py
100
hello
{'prop': 'こんにちは'}
<module 'goodnight' from 'goodnight.pyへのパス'>
```

## 4. from モジュール import 変数、関数、クラス、モジュール as 別名
3と同じ構成で以下のように別名をつけても、別名をつけなかった時と同じ出力になる。  
`main.py`
``` py
from hello import val as v
from hello import hello as h
from hello import Cls as C
from hello import goodnight as g

print(v)
print(h())
print(vars(C('こんにちは')))
print(g)
```

## 5. from モジュール import *
3と同じ構成で`from モジュール import *`形式で読み込むことでfromに指定したモジュールの変数や関数など、まとめてモジュール名なしでアクセスできるようになる。  
なお、暗黙的にすべてのものがimportされてしまうため、*(アスタリスク)による読み込みは推奨されておらず、明示的にimportした方がよい。  

`main.py`
``` py
from hello import *

print(val)
print(hello())
print(vars(Cls('こんにちは')))
print(goodnight)
```

## 6. from パッケージ.モジュール import 変数、関数、クラス、モジュール  (子ディレクトリから読み込む)
`main.py`から1階層下のモジュールを読み込む。  
`from パッケージ.モジュール import モジュール`(モジュール以外も同様に読み込める)で読み込める。

ディレクトリ構成(6と同じ)  
``` sh
.
├── __init__.py
├── main.py
└── package
    ├── child1.py
    └── child2.py
```

`main.py`  
``` py
from package.child1 import child2
print('main:' , child2)
```

実行結果  
``` sh
$ python main.py 
<module 'package.child2' from 'パス/package/child2.py'>
main: <module 'package.child2' from 'パス/package/child2.py'>
```

## 7. from . import 変数、関数、クラス、モジュール  (相対importで同じディレクトリから読み込む)
相対importは**パッケージの中でしか使えない**ことに注意する。  

ためしにトップ階層で同じディレクトリのモジュールを相対import形式の`from . import モジュール`で指定してみる。  

ディレクトリ構成  
``` sh
.
├── __init__.py
├── hello.py
└── main.py
```

`main.py`
``` py
from . import hello
print(hello)
```

実行結果  
```
$ python main.py 
Traceback (most recent call last):
  File "main.py", line 1, in <module>
    from . import hello
ImportError: cannot import name 'hello' from '__main__' (main.py)
```

これはエラーで動かない。  
そこで、次のようにディレクトリ(`package`という名前)を作成し、トップ階層ではないパッケージ内のモジュール(`child1.py`)から同階層のモジュール(`child2.py`)の読み込みを試した。  

ディレクトリ構成  
``` sh
.
├── __init__.py
└── package
    ├── child1.py
    └── child2.py
```

`main.py`  
``` py
from package import child1
print(child1)
```

`child1.py`  
``` py
from . import child2
print(child2)
ch1 = 'data ch1'
```

`child2.py`  
``` py
ch2 = 'data ch2'
```

これは想定通り`child1.py`から同階層の`child2.py`を読み込むことができる。  

実行結果  
``` sh
$ python main.py
<module 'package.child2' from 'パス/package/child2.py'>
<module 'package.child1' from 'パス/package/child1.py'>
```

## 8. from .. import 変数、関数、クラス、モジュール  (相対importで親ディレクトリから読み込む)
そこで、`package`ディレクトリにさらに`subpackage`ディレクトリを作成する。その`subpackage`ディレクトリにある`grandchild1.py`から親ディレクトリの`package`にある`child1.py`を読み込んでみる。  

ディレクトリ構成  
``` sh
.
├── __init__.py
├── main.py
├── package
│   ├── child1.py
│   └── subpackage
│       └── grandchild1.py
```

`main.py`
``` py
from package.subpackage import grandchild1
print(grandchild1)
```

`child1.py`
``` py
child1_val = 200
```

`grandchild1.py`
``` py
from .. import child1
print(child1)
print(child1.child1_val)
```

`subpackage`パッケージにある`grandchild1.py`から、親パッケージにある`child1.py`が読み込めた。  

実行結果  
``` sh
$ python main.py 
<module 'package.child1' from 'パス/package/child1.py'>
200
<module 'package.subpackage.grandchild1' from 'パス/package/subpackage/grandchild1.py'>
```

## 9. from ..パッケージ import 変数、関数、クラス、モジュール  (相対importで兄弟ディレクトリから読み込む)
孫のモジュール`grandchild1.py`から1階層上がり`package`パッケージにある`subpackage2`パッケージの`sub2_grandchild1`モジュールを読み込む。  

ディレクトリ構成
``` sh
.
├── main.py
├── package
│   ├── subpackage
│   │   └── grandchild1.py
│   └── subpackage2
│       └── sub2_grandchild1.py
```

`main.py`
``` py
from package.subpackage import grandchild1
print(grandchild1)
```

`grandchild1.py`
``` py
from ..subpackage2 import sub2_grandchild1
print(sub2_grandchild1)
print(sub2_grandchild1.val)
```

`sub2_grandchild1.py`
``` py
val = 300
```

実行結果
``` sh
$ python main.py 
<module 'package.subpackage2.sub2_grandchild1' from 'パス/package/subpackage2/sub2_grandchild1.py'>
300
<module 'package.subpackage.grandchild1' from 'パス/package/subpackage/grandchild1.py'>
```


## 10. import 標準ライブラリ(`sys`や`math`、`datetime`など)
今まで見てきたように、`import 標準ライブラリ`で読み込んだり、`import 標準ライブラリ as 別名`で別名をつけたり、`from 標準ライブラリ import 変数、関数、クラス`で`標準ライブラリ.変数、関数、クラス`とせず直接、変数や関数にアクセスできるようになる。  

``` py
import sys
import sys as ss
from sys import path
```

## 11. import サードパーティライブラリ(`flask`や`numpy`など)
自作のモジュールや標準ライブラリと同様、特に違いはない。  
下記のいずれも可能。  

``` py
import flask
import flask as fl
from flask import Flask
```

## 12. sys.pathによる検索モジュールの追加 + from 親モジュール  (attempted relative import beyond top-level packageの対応)
子ディレクトリにある`child1.py`から親ディレクトリにある`parent.py`を読み込んでみる。

ディレクトリ構成  
``` sh
.
├── __init__.py
├── main.py
├── parent.py
└── package
    └── child1.py
```

`parent.py`
``` py
val = 100
```

`child1.py`
``` py
from .. import parent
print(parent)
print(parent.val)
```

`main.py`
``` py
from package import child1
print(child1)
```

実行結果  
``` sh
$ python main.py
Traceback (most recent call last):
  File "main.py", line 1, in <module>
    from package import child1
  File "パス/package/child1.py", line 8, in <module>
    from .. import parent
ValueError: attempted relative import beyond top-level package
```

これは`ValueError: attempted relative import beyond top-level package`というエラーになる。  
一番上の階層のパッケージでは相対パスが使えないようだ。  

この場合、対応方法は2つある。  

1つめは実行するモジュールの実行ディレクトリに依存する方法である。
### 実行ディレクトリに依存する親モジュールの読み込み方
Pythonはモジュールの検索対象を`sys.path`にリスト形式で保持している。  
このリストには実行したファイルのパスが格納されている。  
次のようにすることで`sys.path`に格納されているパスの一覧を確認できる。  
`sys.path`の内容をリストをきれいに表示できる`pprint`モジュールで表示する。  

`main.py`
``` py
import sys
from pprint import pprint
pprint(sys.path)
```

実行結果を見ると、一番上に実行した`main.py`のパスが格納されている。  
つまり、実行したファイルのディレクトリにあるモジュールは`import モジュール`で読み込むことができる。  

``` py
~/git/python-dependencies/top $ python main.py 
['/Users/nancy/git/python-dependencies/top',
 '/Users/nancy/.pyenv/versions/3.7.3/lib/python37.zip',
 '/Users/nancy/.pyenv/versions/3.7.3/lib/python3.7',
 '/Users/nancy/.pyenv/versions/3.7.3/lib/python3.7/lib-dynload',
 '/Users/nancy/.pyenv/versions/3.7.3/lib/python3.7/site-packages']
```

よって、親ディレクトリにあるモジュールであるにも関わらず、
`from .. import parent`と書いていた部分を`import parent`とすることで親のモジュールを読み込める。

`child1.py`
``` py
import parent
print(parent)
print(parent.val)
```

実行結果は以下の通り。  
``` py
~/git/python-dependencies/top $ python main.py 
<module 'parent' from '/Users/nancy/git/python-dependencies/top/parent.py'>
100
<module 'package.child1' from '/Users/nancy/git/python-dependencies/top/package/child1.py'>
```

### 実行ディレクトリに依存しない親モジュールの読み込み方
さきほどの`child1.py`を同階層の`child_main.py`から実行してみる。  

ディレクトリ構成
``` sh
.
├── package
│   ├── child1.py
│   └── child_main.py
└── parent.py
```

この場合、`sys.path`に追加されるパスは次のように、親のディレクトリが**含まれていない**。  
``` sh
~/git/python-dependencies/top $ python package/child_main.py 
['/Users/nancy/git/python-dependencies/top/package',
 '/Users/nancy/.pyenv/versions/3.7.3/lib/python37.zip',
 '/Users/nancy/.pyenv/versions/3.7.3/lib/python3.7',
 '/Users/nancy/.pyenv/versions/3.7.3/lib/python3.7/lib-dynload',
 '/Users/nancy/.pyenv/versions/3.7.3/lib/python3.7/site-packages']
```

つまり、`child1.py`で書いた親ディレクトリにあるモジュールの読み込みは、実行するモジュールのディレクトリに依存しているため、モジュールを読み込めない。  
そこで、親のディレクトリパスを**明示的に`sys.path`に追加する**ことで、実行するモジュールのディレクトリに依存しないようにする。  
親のディレクトリパスを追加する方法は2つある。
`os.path`を使って`os.path.join(os.path.dirname(__file__), '..')`とする方法と、  
`pathlib.Path`を使って`str(pathlib.Path(__file__).parent.parent.resolve())`とする方法である。  
いずれの方法でも親のディレクトリをモジュールの検索パスに追加できればよい。  
なお、`pathlib`モジュールはPython3.4から導入されている。  

`child1.py`
``` py {1-5}
import sys
import pathlib
parent_dir = str(pathlib.Path(__file__).parent.parent.resolve())
sys.path.append(parent_dir)
import parent

print(parent)
print(parent.val)
```

実行結果  
``` py
~/git/python-dependencies/top $ python package/child_main.py
<module 'parent' from '/Users/nancy/git/python-dependencies/top/parent.py'>
100
<module 'child1' from '/Users/nancy/git/python-dependencies/top/package/child1.py'>
```

## 13. 環境変数PYTHONPATHでモジュール検索パスを追加

ディレクトリパス  
``` sh
.
├── main.py
└── python_path
    └── special.py
```

以下のように`python_path`パッケージの`special`モジュールを直接読み込もうとする。  
`main.py`
``` py
import special
print(special)
print(special.val)
```

`special.py`
``` py
val=500
```

実行すると、`special`が見つからずエラーになる。  
``` sh
$ python main.py 
Traceback (most recent call last):
  File "main.py", line 1, in <module>
    import special
ModuleNotFoundError: No module named 'special'
```

しかし、`PYTHONPATH`にパスを追加すると、エラーにならず読み込めるようになる。  

``` sh
$ export PYTHONPATH=$PYTHONPATH:./python_path
$ python main.py 
<module 'special' from '/Users/nancy/git/python-dependencies/top/python_path/special.py'>
500
```

<!-- ## 14. パス設定ファイル（.pth）でモジュール検索パスを追加

ディレクトリ構成
``` py
.
├── main.py
└── python_pth
    └── special2.py
```

`main.py`
``` py
import special2
print(special2)
print(special2.val)
```

`special2.py`
``` py
val=600
```

実行すると、`special2`が見つからずエラーになる。  
$ python main.py
Traceback (most recent call last):
  File "main.py", line 1, in <module>
    import special2
ModuleNotFoundError: No module named 'special2'

.pth -->

## 参考
https://docs.python.org/ja/3/reference/import.html  
https://note.nkmk.me/python-import-module-search-path/  
https://chaika.hatenablog.com/entry/2018/08/24/090000  
