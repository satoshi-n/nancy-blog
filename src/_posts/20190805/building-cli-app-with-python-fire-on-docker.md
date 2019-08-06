---
title: python-fireで作ったCLIアプリを1行ずつ確認しながらDocker上で動くようにする
description: python-fireで作ったCLIアプリを1行ずつ確認しながらDocker上で動くようにする
date: 2019-08-05
categories:
  - Python
tags:
  - Docker
permalink: /building-cli-app-with-python-fire-on-docker
---
# {{ $page.title }}


<PostMeta/>

PythonでCLIアプリケーションを作る。[python-fire](https://github.com/google/python-fire)というライブラリを使うことで、関数やクラスのメソッドを簡単にコマンドラインで実行できるようになる。このPythonで作ったCLIアプリケーションをどの環境でも動かせるようにするべくDockerにのせていく。Dockerに慣れているわけではないので、1つずつ確認しながら作っていく。  

## python-fireでCLIアプリケーションを作る
python-fireを使ってPythonのCLIアプリケーションを作る。
pipenvでインストールして、`requirements.txt`に依存関係を書き出す。

``` sh
$ pipenv --python 3.7.4
$ pipenv install fire
$ pipenv lock -r > requirements.txt
```

関数および、クラスのメソッドそれぞれをCLIでアクセスできるPythonスクリプトを作成する。  
クラス`Calculator`はメソッド`add`と`subtract`を持つ。メソッド`add`は引数`x`および`y`を受け取り、足した結果を返す。メソッド`subtract`は引数`x`および`y`を受け取り、引いた結果を返す。  

`app.py`  
``` py
import fire


class Calculator:
    """A simple calculator class."""

    def add(self, x: int, y:int) -> int:
        return x + y

    def subtract(self, x: int, y:int) -> int:
        return x - y


if __name__ == '__main__':
    fire.Fire(Calculator)
```

このクラスを`python app.py`で実行してみると次のようにdocstringで書いた内容がDESCRIPTIONとなり、COMMANDSに`add`および`subtract`メソッドが表示される。  

``` sh
$ pipenv shell
$ python app.py 

NAME
    app.py - A simple calculator class.

SYNOPSIS
    app.py COMMAND

DESCRIPTION
    A simple calculator class.

COMMANDS
    COMMAND is one of the following:

     add

     subtract
```

`add`、`subtract`それぞれをコマンドラインで試してみる。`--引数名=値`として名前引数で指定することもできる。  
期待通りに`add`、`subtract`が動いている。

``` sh
$ python app.py add 1 2
3
$ python app.py add --y=3 --x=2
5
$ python app.py subtract 5 3
2
$ python app.py subtract --y=4 --x=1
-3
```

CLIアプリケーションが作成できたので、次はDockerfileを作成していく。  

## Pythonの公式イメージの確認
次のコマンドでPythonの公式イメージからコンテナを作成し、シェルを実行する。  
  
`docker container run [オプション] イメージ名:[タグ名] [コマンド]`  
  
オプション`-it`でターミナルでコマンドの実行、結果を表示できるようにする。  
オプション`--rm`でコンテナ終了時にコンテナを削除するようにする。  
なお、昔は`docker run`で動いていたが、docker 1.13から`image`に対して操作しているのか、`container`に対して操作しているのか示せるようになり、明示的に操作対象を指定する方法が推奨されるようになったようだ。そのため、`docker container run`で実行するようにした。  
イメージ名は`python`、タグ名はPython3を使うため`3`を指定する。  

Pythonのバージョンと、pipのバージョンを確認してみる。  
Pythonのバージョンは3.7.4、pipのバージョンは19.2.1だった。

``` sh
$ docker container run -it --rm python:3 /bin/bash
root@6f6849fb5cfe:/# python --version
Python 3.7.4
root@6f6849fb5cfe:/# pip --version
pip 19.2.1 from /usr/local/lib/python3.7/site-packages/pip (python 3.7)
```

## WORKDIRコマンドで作業ディレクトリを指定する
`WORKDIR`コマンドで作業ディレクトリを指定する。  

`Dockerfile`
``` docker
FROM python:3
WORKDIR /usr/src/app
```

次のコマンドでイメージを作成する。  
  
`docker image build -t イメージ名[:タグ名] [Dockerfileのディレクトリパス]`  
  
タグ名を省略すると`latest`になる。Dockerfileのディレクトリパスに指定している`.`はコマンドを実行しているディレクトリを示す。  

``` sh
$ docker image build -t python-script .
```

コンテナを起動して、`WORKDIR`で指定したとおり作業ディレクトリが変わっていることを`pwd`コマンドで確認する。

``` sh
$ docker container run -it --rm python-script /bin/bash
root@386ad75a8d34:/usr/src/app# pwd
/usr/src/app
```

## COPYコマンドでrequirements.txtをコンテナへコピーし、RUNコマンドで依存関係を解決する!
COPYコマンドで`requirements.txt`をホストからコンテナへコピーし、RUNコマンドで`pip install`により依存関係を解決する。  

`Dockerfile`
``` docker{4-5}
FROM python:3
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
```

Dockerイメージを作成し、コンテナにログインして`pip list`で依存関係が解決されているか確認する。  
Packageにfireが入っていることが分かる。  

``` sh{5}
$ docker container run -it --rm python-script /bin/bash
root@06c2e1384171:/usr/src/app# pip list
Package    Version
---------- -------
fire       0.2.1
pip        19.2.1
setuptools 41.0.1
six        1.12.0
termcolor  1.1.0
wheel      0.33.4
```

## COPYコマンドでPythonスクリプトをコンテナへコピーする
COPYコマンドでPythonスクリプトをホストからコンテナへコピーする。  

``` docker{7}
FROM python:3
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .
```

Dockerイメージを作成し、コンテナにログインして`ls`でPythonスクリプトがコピーされていることを確認する。

``` sh
root@2d83fc8882d7:/usr/src/app# ls
app.py	requirements.txt
```

## ENTRYPOINTコマンドでPythonスクリプトを実行する
ENTRYPOINTコマンドにすることで、引数をPythonスクリプトに渡せるようになる。  

``` docker{9}
FROM python:3
WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

ENTRYPOINT [ "python", "./app.py" ]
```

これで、`docker container run -it --rm python-script add`のようにクラスのメソッドを指定し、しかもメソッドの引数をそのまま指定できるようになる。`add`、`subtract`ともに動くことを確認できた。ちょっとうれしい。

``` sh
$ docker container run -it --rm python-script add 3 4
7
$ docker container run -it --rm python-script subtract 7 2
5
```

## 参考
https://stackoverflow.com/questions/51247609/what-is-the-difference-between-docker-run-and-docker-container-run  