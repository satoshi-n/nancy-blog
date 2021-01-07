---
title: powerline-goの表示からユーザー名やホスト名の部分(user > DESKTOP-A48OM8R)を消す
description: powerline-go
date: 2021-01-06
categories:
  - wsl2
permalink: /customize-powerline-go
---
# {{ $page.title }}

<PostMeta/>

[Windows Terminalにgitのブランチ名を表示する](/windows-terminal-powerline-go)でWSL2に`powerline-go`を導入してターミナルにgitのブランチ名を表示できるようにした。  

しかし、デフォルトの設定ではパスの表示が横に長すぎて、ノートパソコンだと入力領域が画面の半分くらいから始まっていた。そこでユーザー名やホスト名を表示しないよう設定した。  

![Windows Terminal](./terminal.png)

## powerline-goのカスタマイズ方法

修正前の設定は以下のようになっている。  
この`_update_ps1`関数の`$?`の後ろに`-modules`を追記してオプションを指定することでターミナルの表示を変更できる。  

`~/.bashrc`
``` sh
function _update_ps1() {
    PS1="$($GOPATH/bin/powerline-go -error $?)"
}
if [ "$TERM" != "linux" ] && [ -f "$GOPATH/bin/powerline-go" ]; then
    PROMPT_COMMAND="_update_ps1; $PROMPT_COMMAND"
fi
```

## デフォルトと自分の設定

デフォルトでは以下のように`modules`を設定したのと同じになっている。

``` sh
function _update_ps1() {
    PS1="$($GOPATH/bin/powerline-go -error $? -modules venv,user,host,ssh,cwd,perms,git,hg,jobs,exit,root)"
}
```

なので、この中から表示したいものだけに絞ればよい。  
私は現在のディレクトリとgitのブランチが分かればよかったので以下のような設定にした。  

- `cwd`と`-cwd-mode dironly`オプションで現在のディレクトリだけを表示
- `git`でブランチ名やUntracked filesの数、ローカルブランチの方が進んでいることなどを表示
- `root`でディレクトリ名、git表示部分と入力部分の間に`$`を表示


``` sh
function _update_ps1() {
    PS1="$($GOPATH/bin/powerline-go -error $? -modules cwd,git,root -cwd-mode dironly)"
}
```

これで以下のようにすっきりする。  
![customize Windows Terminal](./customize-terminal.png)
  
参照  
https://github.com/justjanne/powerline-go#customization
