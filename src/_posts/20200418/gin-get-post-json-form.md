---
title: ginでフォーム、JSONのリクエストを受け取る
description: ginでフォーム、JSONのリクエストを受け取る
date: 2020-04-18
categories: 
  - go
permalink: /gin-get-post-json-form
---
# {{ $page.title }}

<PostMeta/>

[Go言語はじめた](/hello-go)でMacにGoが動く環境を作ったので、今日はGoのwebフレームワークである[gin](https://github.com/gin-gonic/gin)をさわる。  
フォーム、JSONのリクエストから取得できる値をたしかめていく。  

## ginをインストールして動かす
まずは`gin`のインストールから始める。  
`go mod init`でモジュールの初期化をする。  

``` sh 
$ go mod init github.com/nansystem/gin-sample
```

`main.go`を作成し、`go run`でwebサーバーをたちあげる。  
``` go
package main

import "github.com/gin-gonic/gin"

func main() {
	r := gin.Default()
	r.GET("/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})
	r.Run()
}
```

``` sh
$ go run main.go 
```

`curl`でアクセスすると、JSONでレスポンスが返ってきた。  
これで`gin`の起動確認ができた。  
``` sh
$ curl http://localhost:8080/ping \
  -H 'Content-Type:application/json'
{"message":"pong"}
```

## URLクエリ文字列の取得
`c.Query`でURLクエリ文字列を取得できる。取得できる値の型は`string`である。  
`c.DefaultQuery`の第二引数でデフォルト値を設定できる。  

``` go
	r.GET("/get", func(c *gin.Context) {
		s := c.Query("str")
		n := c.Query("num")
		b := c.Query("bool")
		l := c.DefaultQuery("limit", "10")
		message := fmt.Sprintf("s: %v, n: %v, b: %v, l: %v", s, n, b, l)
		c.String(http.StatusOK, message)
  })
```

`curl`のオプション`--get`で後続の値をクエリ文字列とし、`--data-urlencode`でURLエンコーディングしてリクエストする。  
`GET /get?str=%E6%96%87%E5%AD%97%E5%88%97&num=123&bool=true HTTP/1.1`

``` sh
$ curl http://localhost:8080/get \
  --get \
  --data-urlencode 'str=文字列' \
  --data-urlencode 'num=123' \
  --data-urlencode 'bool=true'
s: 文字列, n: 123, b: true, l: 10
```

## URLパスの取得
`:name`のようにコロンに続けてパス名を指定することで`c.Param("name")`で値を取得する。  
`*action`のようにアスタリスクに続けてパス名を指定すると、`c.Param("action")`で残りの全てのパスを取得する。  

``` go
	r.GET("/path/:name/*action", func(c *gin.Context) {
		name := c.Param("name")
		action := c.Param("action")
		message := name + " is " + action
		c.String(http.StatusOK, message)
	})
```

``` sh
$ curl http://localhost:8080/path/hoge/fuga/piyo/
hoge is /fuga/piyo/
```

## フォームのPOST
`c.PostForm`でフォームの値を取得できる。取得できる値の型は`string`である。  
`c.DefaultPostForm`の第二引数でデフォルト値を設定できる。  

``` go
	r.POST("/post", func(c *gin.Context) {
		s := c.PostForm("str")
		n := c.PostForm("num")
		b := c.PostForm("bool")
		l := c.DefaultPostForm("limit", "10")
		message := fmt.Sprintf("s: %v, n: %v, b: %v, l: %v", s, n, b, l)
		c.String(http.StatusOK, message)
	})
```

``` sh
$ curl -X POST http://localhost:8080/post \
  --data-urlencode 'str=文字列P'  \
  --data-urlencode 'num=1234'  \
  --data-urlencode 'bool=false' \
  --data-urlencode 'limit=20'
s: 文字列P, n: 1234, b: false, l: 20
```

## JSONのPOST

`struct`を用意する。  
``` go
type JsonRequest struct {
	FieldStr  string `json:"field_str"`
	FieldInt  int    `json:"field_int"`
	FieldBool bool   `json:"field_bool"`
}
```

JSONから`struct`へ値をマッピングするのは`BindJSON`か`ShouldBindJSON`関数のいずれかを使う。  
`BindJSON`はHTTPステータスを400にして、Content-Typeヘッダーを`text/plain`にするようだ。  
`application/json`でレスポンスを返したいから、`ShouldBindJSON`を使う。  
`gin.H`は`map[string]interface{}`のショートカット。

> This sets the response status code to 400 and the Content-Type header is set to text/plain; charset=utf-8. 
https://github.com/gin-gonic/gin#model-binding-and-validation

> gin.H is a shortcut for map[string]interface{}  
https://github.com/gin-gonic/gin#xml-json-yaml-and-protobuf-rendering

``` go
	r.POST("/postjson", func(c *gin.Context) {
		var json JsonRequest
		if err := c.ShouldBindJSON(&json); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"str": json.FieldStr, "int": json.FieldInt, "bool": json.FieldBool})
	})
```

空のJSONを渡してもエラーにならない。  
``` sh
$ curl -X POST http://localhost:8080/postjson \
  -H 'content-type: application/json' \
	-d '{}'
{"bool":false,"int":0,"str":""}
```

`struct`に存在していないフィールドを渡しても無視されてエラーにはならない。  
``` sh
$ curl -X POST http://localhost:8080/postjson \
  -H 'content-type: application/json' \
	-d '{ "hoge": 1 }'
{"bool":false,"int":0,"str":""}
```

型が違えばエラーになる。  
``` sh
 $ curl -X POST http://localhost:8080/postjson \
  -H 'content-type: application/json' \
  -d '{ "field_str": 1 }'
{"error":"json: cannot unmarshal number into Go struct field JsonRequest.field_str of type string"}
```

型があっていれば`struct`に値が無事マッピングされる。  
``` sh
$ curl -X POST http://localhost:8080/postjson \
  -H 'content-type: application/json' \
  -d '{ "field_str": "文字だ", "field_int": 12, "field_bool": true }'
{"bool":true,"int":12,"str":"文字だ"}
```
