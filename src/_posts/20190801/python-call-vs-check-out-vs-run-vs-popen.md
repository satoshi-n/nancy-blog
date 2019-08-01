---
title: Pythonからシェルを実行するsubprocessモジュールのcall、check_output、run、popenの違い
description: 
date: 2019-08-01
categories:
  - Python
permalink: /python-call-vs-check-out-vs-run-vs-popen
---
# {{ $page.title }}

<PostMeta/>

Pythonからシェルを実行したい。  
subprocessモジュールから`call`、`check_output`、`run`、`Popen`を実行することで出来るので、それぞれの違いを見ていく。  
本記事はPython3.7.3で動かしている。  

## subprocessモジュールのまとめ
| メソッド | 概要 |
----|---- 
| call | メソッドの戻り値は終了ステータス。 |
| check_output | メソッドの戻り値は出力の内容。<br>終了ステータスが`0`以外の場合、例外が投げられるためハンドリングが必要。 |
| run | 公式のドキュメントでサブプロセスを起動する時に使うことを**推奨**されている。Python3.6から使える。終了ステータス、標準出力、標準エラー出力を取得できる。 |
| Popen(メソッドではなくクラス) | シェル起動後に**シェルの終了を待たず後続処理を実行できる**。また、`communicate`メソッドを使うことでシェルの終了を待ち後続処理を実行することもできる。その場合、終了ステータス、標準出力、標準エラー出力を取得できる。 |

結論として、シェルを実行するときはPython3.6以上であれば`subprocess.run`を使えば良い。  シェルの終了を待たずに後続処理を実行したい場合は`subprocess.Popen`を使う。  


## Pythonから実行するシェルを用意する
以下のように2秒後に`echo`で標準出力するシェルを用意する。  
`wait.sh`
``` sh
#!/bin/sh

sleep 2
echo 'hello'
```

実行権限を付与してこのシェルを実行すると、sleepで指定した2秒後に標準出力に`hello`と出力される。  
終了ステータスは`0`が返される。  

``` sh
$ chmod u+x wait.sh
$ ./wait.sh
hello
$ echo $?
0
```

## subprocess.callからシェルを実行する
次のPythonスクリプトを実行すると、`start`とまず表示され、2秒経過後に終了ステータス、`end`が表示される。

`exec_sh.py`
``` py
import subprocess
print('start')
returncode = subprocess.call(['./wait.sh'])
print(returncode)
print('end')
```

``` sh
$ python exec_sh.py
start
# ここで2秒何も表示されない
hello
0
end
```

なお、終了ステータスが1の場合でも`subprocess.call`で例外は投げられず、最後の`end`まで実行される。  

## subprocess.check_outputからシェルを実行する
`subprocess.call`の戻り値が終了ステータスであったのに対して、`subprocess.check_output`の戻り値は出力になる。

``` py
import subprocess

print('start')
output = subprocess.check_output(['./wait.sh'])
print('end')
```

Pythonスクリプトを実行すると、`echo`で標準出力される内容が`output`に渡されていることがわかる。  

``` sh
$ python exec_sh.py
start
b'hello\n'
end
```

終了ステータスが1の場合には、`subprocess.CalledProcessError`例外が投げらるため、この例外をtry/exceptでハンドリングする必要がある。  
例外の`returncode`に終了ステータス、`output`に出力の内容が格納されている。  

`exec_sh.py`
``` py
import subprocess

print('start')
try:
  output = subprocess.check_output(['./wait.sh'])
except subprocess.CalledProcessError as e:
  print(f"returncode:{e.returncode}, output:{e.output}")
print('end')
```

上記のコードを確認するためシェルを変更する。  
`hello`と出力した後、終了ステータスが1で終わるようにする。  
`wait.sh`のファイル末尾に以下のコードを追加する。  
``` sh
exit 1
```

Pythonスクリプトを実行すると`start`と表示され、2秒経過後に`except`に記載した終了ステータスとアウトプットが表示され、最後に`end`と表示される。  
``` sh
$ python exec_sh.py 
start
returncode:1, output:b'hello\n'
end
```

## subprocess.runからシェルを実行する
推奨されてる`subprocess.run`からシェルを実行する。  
  
> サブプロセスを起動するために推奨される方法は、すべての用法を扱える run() 関数を使用することです。
https://docs.python.org/ja/3/library/subprocess.html#using-the-subprocess-module
  
`run`メソッドの戻り値は`CompletedProcess`インスタンスである。  
`CompletedProcess.returncode`で終了ステータス、`CompletedProcess.stdout`で標準出力、`CompletedProcess.stderr`で標準エラー出力を取得できる。  `subprocess.Popen`のように`communicate`のような他のメソッドを呼び出す必要がなく、`run`メソッドの戻り値として一通り結果を取得できるため扱いやすい。  

``` py
import subprocess

print('start')
completed_process = subprocess.run(['./wait.sh'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
print(f'returncode: {completed_process.returncode},stdout: {completed_process.stdout},stderr: {completed_process.stderr}')
print('end')
```

実行する`wait.sh`は標準出力、標準エラー出力、終了ステータスが確認できるよう、それぞれ値を設定する。  
``` sh
#!/bin/sh

sleep 2
echo 'hello'
echo 'err' >&2
exit 100
```

実行すると、一通り取得できていることを確認できる。  
``` sh
$ python exec_sh.py 
start
returncode: 100,stdout: b'hello\n',stderr: b'err\n'
end
```

## subprocess.Popenからシェルを実行する
`subprocess.call`の戻り値が終了ステータス、`subprocess.check_output`の戻り値が出力であったのに対して、`subprocess.Popen`の戻り値は`Popen`インスタンスである。  

`exec_sh.py`  
``` py
import subprocess

print('start')
popen_obj = subprocess.Popen(['./wait.sh'])
print(popen_obj)

print('end')
```

Pythonスクリプトを実行すると`start`、`<subprocess.Popen object at 0x1075fbe10>`、`end`が続けて表示される。そして、2秒後`hello`が表示される。  
`subprocess.call`や`subprocess.check_output`で実行したときは`wait.sh`の結果を待って、後続処理が動いていたが、`subprocess.Popen`は`wait.sh`の**結果を待たず**に後続処理が動く。  
さて、このままだと`wait.sh`の結果を受け取ることができない。  
  
シェルの実行を待つ方法として`Popen`インスタンスの`wait`メソッド、`communicate`メソッドの2つが用意されている。
`wait`の方は標準出力に大量のデータを出力すると処理が止まってしまう。
> stdout=PIPE や stderr=PIPE を使っていて、より多くのデータを受け入れるために OS のパイプバッファーをブロックしているパイプに子プロセスが十分な出力を生成した場合、デッドロックが発生します。これを避けるには Popen.communicate() を使用してください。https://docs.python.org/ja/3/library/subprocess.html#subprocess.Popen.wait

そのため、`communicate`メソッドを使う方法を見て行く。  
`communicate`メソッドは戻り値として標準出力、標準エラー出力のタプル`(stdout_data, stderr_data)`を返す。  
また、`Popen`インスタンスからは`returncode`が取得できる。  

`exec_sh.py`  
``` py
import subprocess

print('start')
popen_obj = subprocess.Popen(['./wait.sh'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
stdout_data, stderr_data = popen_obj.communicate()
print(popen_obj.returncode)
print('stdout_data:', stdout_data, ' stderr_data:', stderr_data)
print('end')
```

実行した結果、シェルの実行を待ち、標準出力、標準エラー出力、終了ステータスの内容が取得できている。

``` sh
$ python exec_sh.py 
start
100
stdout_data: b'hello\n'  stderr_data: b'err\n'
end
```

## 参考  
https://docs.python.org/ja/3/library/subprocess.html#subprocess  
https://stackoverflow.com/questions/38088631/what-is-a-practical-difference-between-check-call-check-output-call-and-popen-m/40768384  
https://stackoverflow.com/questions/13332268/how-to-use-subprocess-command-with-pipes  