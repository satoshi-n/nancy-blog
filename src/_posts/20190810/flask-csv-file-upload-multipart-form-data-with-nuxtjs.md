---
title: Flask + Nuxt.js(spa) + axiosでCSVファイルをmultipart/form-dataによりアップロードする
description: Flask + Nuxt.js(spa) + axiosでCSVファイルをmultipart/form-dataによりアップロードする
date: 2019-08-10
categories:
  - Flask
  - Nuxt.js
permalink: /flask-csv-file-upload-multipart-form-data-with-nuxtjs
---
# {{ $page.title }}


<PostMeta/>

Flask + Nuxt.js + axiosでCSVファイルをmultipart/form-dataによりアップロードする。なお、Nuxt.jsのモードは`spa`にしている。
FlaskとNuxt.jsの連携を確認したいので、バリデーションやエラーのハンドリングはしない。  
まずFlaskでファイルのアップロードを確認し、その後Nuxt.jsでファイルをアップロードしていく。  

## FlaskでCSVファイルをmultipart/form-dataによるアップロード(POST)を受けつける

### Flaskをインストールする
`pipenv`で`Flask`が動く環境を作る。  

``` sh
$ touch Pipfile
$ pipenv --python 3.7.4
$ pipenv install Flask==1.1.1
```

`Flask`が動くことを次のコードで確認する。  

`app.py`
``` py
from flask import Flask

app = Flask(__name__)


@app.route('/')
def hello():
    return 'hello'


if __name__ == "__main__":
    app.run(debug=True)
```

次のコマンドで起動することで、オートリロードを有効にする。  
`FLASK_ENV=development flask run`

``` sh
$ FLASK_ENV=development flask run
...(略)
Running on http://127.0.0.1:5000/ (Press CTRL+C to quit)
```

`curl`で`/`にアクセスし、`hello`がレスポンスで返ってくることを確認する。  

``` sh
$ curl http://127.0.0.1:5000/
hello
```

### FlaskでPOSTを受けつけるようにする
`@app.route`の`methods`で`POST`を受け付けるようにする。  

`app.py`
``` py
@app.route("/api/upload", methods=["POST"])
def upload():
    return 'アップロード成功'
```

`curl`のオプション`-X HTTPメソッド`によりPOSTでレスポンスが返ってくることを確かめる。  

``` sh
$ curl -X POST http://127.0.0.1:5000/api/upload
アップロード成功
```

### Flaskでmultipart/form-dataのファイルを受けつける  
`app.config['UPLOAD_FOLDER']`にアップロード先のディレクトリを指定しておく。  
`multipart/form-data`によりアップロードされたファイルは`request.files`に格納されている。  
`request.files[フィールド名]`からファイルを`FileStorage`オブジェクトとして取得する。  
`FileStorage`オブジェクトは`save`メソッドを持っており、このメソッドでファイルを保存することができる。  
保存時は`secure_filename`関数で安全なファイル名にする。  

``` py
import os
from flask import Flask, request
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = './uploads'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER


@app.route("/api/upload", methods=["POST"])
def upload():
    fileStorageObj = request.files['file']
    filename = secure_filename(fileStorageObj.filename)
    fileStorageObj.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return 'アップロード成功'


if __name__ == "__main__":
    app.run(debug=True)
```

テスト用のダミーCSVを用意する。  

`dummy.csv`
``` csv
name,age,pref
田原 唯菜,56,香川県
伊沢 圭一,57,鳥取県
鈴村 良夫,6,千葉県
```

このファイルを`curl`でアップロードする。  
`multipart/form-data`は`-F フィールド名=値`で指定する。ファイルの場合は`@ファイル名`で指定する。  

``` sh
$ curl -X POST -F file=@dummy.csv http://127.0.0.1:5000/api/upload
アップロード成功
```

`uploads`ディレクトリにファイルが格納されていることが確認できる。  

### ファイルと一緒にテキストもリクエストする  
ファイルと一緒にテキストもリクエストできることを確認しておく。  

ファイルの取得は以下の形で行うが、  
``` py
request.files['file']
```

ファイル以外の取得は`form[フィールド名]`で取得する。
``` py
request.form['text']
```

このフィールドを`print`で表示できるようにし、`curl`で確認する。

``` sh
$ curl -X POST -F file=@dummy.csv -F text="大切なCSVです"  http://127.0.0.1:5000/api/upload
```

### レスポンスをJSONにする
`Nuxt.js`の`axios`で扱うためレスポンスをJSONにする。  
`JSON_AS_ASCII`を設定して、日本語が文字化けしないようにする。  
  
`app.config['JSON_AS_ASCII'] = False`  
  
戻り値は`jsonify(オブジェクト)`としてJSONで返せるようにする。  

エラーの場合は`abort(400, {'message': 'ファイルは必須です'})`を呼び出し、
`@app.errorhandler(400)`でエラーをハンドリングする。  

`app.py`
``` py
import os
from flask import Flask, request, jsonify, abort
from werkzeug.utils import secure_filename

UPLOAD_FOLDER = './uploads'

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['JSON_AS_ASCII'] = False


@app.route("/api/upload", methods=["POST"])
def upload():
    print(request.form['text'])
    if 'file' not in request.files:
        return abort(400, {'message': 'ファイルは必須です'})
    fileStorageObj = request.files['file']
    filename = secure_filename(fileStorageObj.filename)
    fileStorageObj.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
    return jsonify({'message': 'アップロード成功'})


@app.errorhandler(400)
def custom400(error):
    return jsonify({'message': error.description['message']})

if __name__ == "__main__":
    app.run(debug=True)
```

ファイル、テキストを指定した場合は`アップロード成功`と返ってくる。  
``` sh
$ curl -X POST -F file=@dummy.csv -F text="大切なCSVです" http://127.0.0.1:5000/api/upload
{
  "message": "アップロード成功"
}
```

また、ファイルをあえて指定しない場合は`ファイルは必須です`とエラーハンドリング通り返ってくる。  

``` sh
$ curl -X POST -F text="大切なCSVです" http://127.0.0.1:5000/api/upload
{
  "message": "ファイルは必須です"
}
```

ここまででFlaskアプリケーションの実装は終わり。

## Nuxt.jsでCSVファイルをmultipart/form-dataによりアップロード(POST)する
つぎはNuxt.jsの実装を進めていく。  

`npx create-nuxt-app プロジェクト名`でプロジェクトを作成する。  
`Axios`をインストールし、`mode`を`Single Page App`にする。他の設定項目はデフォルトのままにした。  

``` sh
$ npx create-nuxt-app ui
? Choose features to install Axios
? Choose rendering mode Single Page App
```

`nuxt.config.js`で`axios`のオプション`proxy`を`true`とし、`proxy`で`api`にアクセスがきたらFlaskに渡すよう設定する。  

`nuxt.config.js`
``` js
  axios: {
    proxy: true
  },
  proxy: {
    '/api/': 'http://127.0.0.1:5000/',
  },
```

`npm run dev`で起動し、`proxy`の設定を確認する。  
``` sh
$ npm run dev
...略
Listening on: http://localhost:3000/
```

`Nuxt.js`は3000番ポートで起動するので、`http://localhost:3000/api/upload`に向けてcurlでPOSTする。  
今まで通りレスポンスが返ってきている。  

``` sh
$ curl -l -X POST -F file=@dummy.csv  -F text="大切なCSVです"  http://localhost:3000/api/upload
{
  "message": "アップロード成功"
}
```

あとはコンポーネントを作れば良い。  
`template`部分は、テキストは`v-model`で入力をうけつける。  
ファイルは`type="file"`としたうえで、`@change`イベントでファイルが選択されたときのハンドリングをする。  `event.target.files[0]`からファイルを取得し、`data`に保持しておく。  
アップロードするボタンが押されたら、`multipart/form-data`でPOSTするために`new FormData()`に対して`text`、`file`を`append`する。  
`this.$axios.post(URL, formData, options)`でPOSTする。  
第一引数にURLを指定し、第二引数に`formData`を指定する。第三引数の`options`でHTTPヘッダーに`multipart/form-data`を指定する。  
`index.vue`
``` vue
<template>
  <section class="container">
    <form>
      <input v-model="text" />
      <input type="file" @change="onChange" />
      <button type="button" @click="onSubmit">アップロードする</button>
    </form>
  </section>
</template>

<script>
export default {
  data() {
    return {
      text: '',
      file: null,
    }
  },
  methods: {
    onChange(event) {
      this.file = event.target.files[0]
    },
    async onSubmit() {
      const formData = new FormData()
      formData.append('text', this.text) 
      formData.append('file', this.file)
      const response = await this.$axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }).catch(error => {
        return error.response
      })
      console.info(response.data.message)
    }
  }
}
</script>
```

画面からテキストを入力し、画像を選択して「アップロードする」するボタンを押すと`uplodas`ディレクトリにファイルがアップロードされ、ブラウザのコンソールにメッセージが表示される。  
``` 
info アップロード成功
```
また、画像を選択しなかった場合、400エラーとなり、エラーメッセージが取得できる。  
```
POST http://localhost:3000/api/upload 400 (BAD REQUEST)
info ファイルは必須です
```

## 参考
https://flask.palletsprojects.com/en/1.1.x/patterns/fileuploads/?highlight=upload  
http://tm-webtools.com/Tools/TestData  
https://stackoverflow.com/questions/21294889/how-to-get-access-to-error-message-from-abort-command-when-using-custom-error-ha  
https://werkzeug.palletsprojects.com/en/0.15.x/datastructures/#werkzeug.datastructures.ImmutableMultiDict  
https://werkzeug.palletsprojects.com/en/0.15.x/datastructures/#werkzeug.datastructures.FileStorage  
