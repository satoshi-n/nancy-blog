---
title: gvmでGoのバージョンを変更する
description: Goのバージョンを変更して試したかったのでGoのバージョン管理ツールgvmを使った
date: 2020-04-17
categories: 
  - go
permalink: /gvm-go-version-management
---
# {{ $page.title }}

<PostMeta/>

Goのバージョンを変更して試したかったのでGoのバージョン管理ツール[gvm](https://github.com/moovweb/gvm)を使った。  
インストール前のGoのバージョンは1.14だ。  

``` sh
$ go version
go version go1.14 darwin/amd64
```
  
gvmをインストールし、 `Please restart your terminal session or to get started right away run`と表示されている通りに`source`コマンドを実行する。  
``` sh
$ bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
$ source /Users/nancy/.gvm/scripts/gvm
```

go1.12をインストールしたかったので、`gvm install go[バージョン]`でgoをインストールする。  
``` sh
$ gvm install go1.12
```

`gvm use go[バージョン]`でインストールしたgoのバージョンを切り替える。  
`go version`で確認すると、確かにバージョンが変わっている。  
`which`でコマンドの場所を確認すると、`.gvm`ディレクトリ下に格納されていた。  
``` sh
$ gvm use go1.12
Now using version go1.12
$ go version
go version go1.12 darwin/amd64
$ which go
/Users/nancy/.gvm/gos/go1.12/bin/go
```

一旦ターミナルを落として、再度開くと`gvm`が動かなかったので`~/.bash_profile`に登録した。  
``` sh
~ $ gvm
-bash: gvm: command not found
```

``` sh
$ cat $HOME/.gvm/scripts/gvm >> ~/.bash_profile
$ . ~/.bash_profile
```

`--default`オプションをつけることで、ターミナルを閉じてもそのバージョンが使われるようになる。  
``` sh
$ gvm use go1.12 --default
Now using version go1.12
```
