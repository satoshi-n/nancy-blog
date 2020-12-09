---
title: Windows Terminalにgitのブランチ名を表示する
description: Windows Terminalにgoをインストールし、powerline-goでブランチ名を表示する方法
date: 2020-12-09
categories:
  - wsl2
permalink: /windows-terminal-powerline-go
---
# {{ $page.title }}

<PostMeta/>

WSL2のUbuntu 20.04をWindows Terminalで開いた時に、コマンドラインにgitのブランチ名が表示されるようにする。  

## fontのインストール
コンソールで '▯' と文字化けしないようにfontをインストールする。  
以下のリンクから`CascadiaCode-2009.22.zip`のような名前の最新のファイルをダウンロードする。  
  
https://github.com/microsoft/cascadia-code/releases  
  
ダウンロードしたらzipファイルを解凍し、`ttf`フォルダを開き、`Cascadia Code PL`または`Cascadia Mono PL`を右クリックし、
すべてのユーザーに対してインストールする。

## settings.jsonの変更
Windows Terminalを開き、`ctrl + ,`のショートカット、あるいはのタブから設定を選択し、`settings.json`を開く。  
profiles > defaults > fontFaceにインストールしたフォントを指定する。

`settings.json`一部抜粋
``` json
{
    "profiles":
    {
        "defaults":
        {
            // Put settings here that you want to apply to all profiles.
            "fontFace":  "Cascadia Code PL"
        },
    }
}
```

## powerline-goの設定
`powerline-go`をインストールしbashに設定することでgitのブランチ名を表示できるようにしていく。

### goのインストール
goが入っていない場合は、`sudo apt install golang-go`あるいは`gvm`などでgoをインストールする。  

### powerline-goをインストール
`powerline-go`をインストールする。  

``` sh
$ go get -u github.com/justjanne/powerline-go
```

### bashrcの設定  
`~/.bashrc`に以下の記述を追加する。

なお、bash以外での設定方法も記載されている。  
https://github.com/justjanne/powerline-go  

自分は`gvm`で入れて`GOPATH`は設定されていたので、`GOPATH=$HOME/go`は記述していない。  

``` sh
GOPATH=$HOME/go
function _update_ps1() {
    PS1="$($GOPATH/bin/powerline-go -error $?)"
}
if [ "$TERM" != "linux" ] && [ -f "$GOPATH/bin/powerline-go" ]; then
    PROMPT_COMMAND="_update_ps1; $PROMPT_COMMAND"
fi
```

`. ~/.bashrc`で設定を読み込み直す。

## コマンドラインにgitのブランチ名が表示される
ここまでの設定で、以下のようにコマンドラインにgitのブランチ名が表示される。

![Windows Terminal](./terminal.png)

  
参考  
https://github.com/moovweb/gvm  
https://docs.microsoft.com/en-us/windows/terminal/tutorials/powerline-setup  
https://github.com/justjanne/powerline-go  
