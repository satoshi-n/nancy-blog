---
title: JavaScript dayjsはMoment.jsの代替になるか?
description: JavaScriptの日付操作には罠が多く、業務では日付操作を簡単かつ安全に操作するライブラリが使われる。日付操作のライブラリ中でもMoment.js(Star数40,601)がよく知られているが、ファイルサイズが大きくパフォーマンス改善の妨げになることがある。そこでこの記事ではMoment.jsの代替となるdayjsを紹介する。
date: 2019-03-28
categories:
  - JavaScript
tags:
  - dayjs
permalink: /dayjs-alternative-to-momentjs 
---
# {{ $page.title }}

<PostMeta/>

JavaScriptの日付操作には罠が多く、業務では日付操作を簡単かつ安全に操作するライブラリが使われる。日付操作のライブラリの中でも[Moment.js](https://github.com/moment/moment)(Star数40,601)はよく知られているが、ファイルサイズが大きくパフォーマンス改善の妨げになることがある。  
そこでこの記事ではより軽量でMoment.jsの代替となる[dayjs](https://github.com/iamkun/dayjs)(Star数19,872)を紹介する。

<!-- DOMException: Failed to execute 'appendChild' on 'Node': This node type does not support this method.
[[toc]] -->

## dayjsとは
dayjsとは、**日付操作を簡単にするJavaScriptのライブラリ**だ。Moment.jsのAPIと広く互換があり、gzip圧縮されたサイズは**2.71KBと軽量**なのが特徴だ。

## インストール
dayjsが十分Moment.jsの代わりになり得るのか確認していく。  
まずはインストールして、業務で使われる日付操作をみていく。

``` sh
npm install dayjs --save
```

package.json
``` json
{
  "dependencies": {
    "dayjs": "^1.8.11",
  }
}
```

## dayjs/locale/jaでロケールを指定する
ロケールを指定することで、月や曜日をロケールごとの表示に変更することができる。
`'dayjs/locale/ja';`をインポートして、`dayjs.locale('ja')`とすることで日本語用のロケールが設定される。
ロケール設定前は月の表示が「March」だったのに対して、ロケール設定後は「3月」と表示されるようになる。同様に、曜日は「Tuesday」から「火曜日」、短縮した曜日は「Tue」から「火」に変換されることがわかる。

ロケールの指定前
``` js
console.info(dayjs().format('月:MMMM 曜日:dddd 曜日短縮:ddd'));// 月:March 曜日:Tuesday 曜日短縮:Tue
```

ロケールの指定後
``` js
import 'dayjs/locale/ja';
dayjs.locale('ja');
console.info(dayjs().format('月:MMMM 曜日:dddd 曜日短縮:ddd'));// 月:3月 曜日:火曜日 曜日短縮:火
```

## パース - 現在日時、Dateオブジェクト、ISO 8601文字列、年月日の区切り文字の違い

### 現在日時の取得
現在日時を生成するには`dayjs`関数を引数なしで実行する。  
``` js
console.info(dayjs().format()); // 2019-03-26T20:36:46+09:00
```

### 年月日時分秒を指定してDayjsオブジェクトを生成する
`dayjs`関数の引数に年月日時分秒を直接渡したい場合は、`new Date`を経由するか個別に`set`する。　
ここでは`Date`オブジェクトを通して年月日時分秒を渡す方法を記載する。ただし月は0から始まることを考慮する。

``` js
console.info(dayjs(new Date(2019, 2, 25, 19, 31, 59)).format('')); // 2019-03-25T19:31:59+09:00
```

### ISO 8601文字列からDayjsオブジェクトを生成する 
ISO 8601文字列もパースできる。  
``` js
console.info(dayjs('2019-03-25T23:58:59.999Z').format()); // 2019-03-26T08:58:59+09:00
```

### -区切りと/区切りでDayjsオブジェクトは同じ日時を生成する
`new Date`を使う場合、区切り文字により返される日時が違うが、`dayjs`は同じ日時が生成されるので安心できる。

``` js
console.info(new Date('2019-03-25'));       // 2019-03-25T00:00:00.000Z
console.info(new Date('2019/03/25'));       // 2019-03-24T15:00:00.000Z
console.info(dayjs('2019-03-25').format()); // 2019-03-25T00:00:00+09:00
console.info(dayjs('2019/03/25').format()); // 2019-03-25T00:00:00+09:00
```

## バリデーション
`isValid`メソッドにより`Dayjs`オブジェクトとして有効か判定できる。  
ただし、以下の通りの結果なので、ユーザーが入力した日付が正しい形式か判定するのには使えない。  
- `2019-02-29`が`true`になるので実在する日付かどうかの判定には使えない。  
- `2019-02`や`2019-02-X`、`10000-01-01`が`true`になるので入力に年月日を期待している場合は使えない。  
- `undefined`は`true`を返すが、`null`や空文字は`false`になるので注意する。  

``` js
console.info(dayjs('2019-02-29').isValid()); // true
```

## 取得/設定 - JST、UTC、年月日時分秒の個別指定
簡単に年月日時分秒の取得/設定ができる。  
ただし、`month`は0から始まることを考慮する。また、`'2019-03-25T14:58:59Z'`のようなUTCの場合、`hour`がそのままの`14`にならないことに注意する。

### タイムゾーンの確認
ローカルのタイムゾーン確認のため`moment-timezone`をインストールする。
``` sh
npm install moment-timezone --save
```

package.json
``` json
  "dependencies": {
    "dayjs": "^1.8.11",
    "moment-timezone": "^0.5.23"
  }
```

タイムゾーンは`moment-timezone`を使って`moment.tz.guess()`で確認する。  
実行すると今実行している環境のタイムゾーンは「Asia/Tokyo」と判定された。

``` js
import moment from 'moment-timezone';
console.info(moment.tz.guess()); // Asia/Tokyo
```

日本標準時(JST)、協定世界時(UTC)、Zが末尾にない場合、年月日時分秒の個別指定それぞれの挙動を確認する。

### 日本標準時(JST)の取得
``` js
const jstDate = dayjs('2019-03-25T23:58:59+09:00');
console.info(jstDate.year());   // 2019
console.info(jstDate.month());  // 2
console.info(jstDate.date());   // 25
console.info(jstDate.day());    // 1
console.info(jstDate.hour());   // 23
console.info(jstDate.minute()); // 58
console.info(jstDate.second()); // 59
```

### 協定世界時(UTC)の取得
UTCで`Dayjs`オブジェクトを生成している場合、日本と9時間ずれるため、日時の取得時に想定していた値が取れないことがある。
``` js
const utcDate = dayjs('2019-03-25T14:58:59Z')
console.info(utcDate.year());   // 2019
console.info(utcDate.month());  // 2
console.info(utcDate.date());   // 25
console.info(utcDate.day());    // 1
console.info(utcDate.hour());   // 23
console.info(utcDate.minute()); // 58
console.info(utcDate.second()); // 59
```

### Zが末尾にない場合の取得
日時の末尾に`Z`がない場合はUTCとして扱われず9時間ずれない。
``` js
const utcNoZDate = dayjs('2019-03-25T14:58:59');
console.info(utcNoZDate.year());   // 2019
console.info(utcNoZDate.month());  // 2
console.info(utcNoZDate.date());   // 25
console.info(utcNoZDate.day());    // 1
console.info(utcNoZDate.hour());   // 14
console.info(utcNoZDate.minute()); // 58
console.info(utcNoZDate.second()); // 59
```

### 年月日時分秒の個別指定
取得と同様に、設定は同じメソッドに引数を指定することでできる。
``` js
const settingDate = dayjs().year(2018).month(0).date(1).hour(12).minute(35).second(48);
console.info(settingDate.format()); // 2018-01-01T12:35:48+09:00
``` 

## 操作 - 月初、月末、先月、来月、時分秒の切り捨て、1日の終わり、7日前、7日後
`startOf`、`endOf`、`add`、`subtract`の引数に年月日時分秒を指定することでいずれの[単位](#引数に使われる単位)でも日時の演算ができる。
そのため、月初、月末や先月、来月、時分秒の切り捨てや1日の最後の時分秒、X日前、X日後を求めることができる。

基準となる日付を「2019-03-30T23:58:59+09:00」として定義しておく。
``` js
import dayjs from 'dayjs';
const date = dayjs('2019-03-30T23:58:59+09:00');
```

### 月初の取得
月初の取得は`startOf`メソッドの引数に`month`を指定することで取得できる。
`startOf`メソッドの第一引数には[単位](#引数に使われる単位)を指定する。

``` js
console.info(date.startOf('month').format()); // 2019-03-01T00:00:00+09:00
```

### 月末の取得
月末の取得は`endOf`メソッドの引数に`month`を指定することで月の末日、すなわち月末を取得できる。
時分秒は`23:59:59`になる。

``` js
console.info(date.endOf('month').format()); // 2019-03-31T23:59:59+09:00
```

### 先月の取得
先月の取得は`subtract`メソッドにより月を1ヵ月分引き算することで取得できる。
`subtract`メソッドの第一引数は引き算する値、第二引数が[単位](#引数に使われる単位)だ。  
なお、時分秒は変わらない。

``` js
console.info(date.subtract(1, 'month').format()); // 2019-02-28T23:58:59+09:00
```

### 来月の取得
来月の取得は`add`メソッドにより1ヵ月分加算することで取得できる。
`add`メソッドの引数は`subtract`メソッドと同じで、時分秒が変わらないのも同様だ。

``` js
console.info(date.add(1, 'month').format()); // 2019-04-30T23:58:59+09:00
``` 

### 時分秒を00:00:00にする(時分秒を切り捨てる、1日の始まり)
時分秒を00:00:00にする、すなわち時分秒を切り捨てて、1日の始まりを求めるには、
`startOf`メソッドを使う。引数を`date`とすることで時分秒が`00:00:00｀となる。

``` js
console.info(date.startOf('date').format()); // 2019-03-30T00:00:00+09:00
```

### 時分秒を23:59:59にする(1の終わり)
時分秒を23:59:59にする、すなわち1日の終わりを求めるには、
`endOf`メソッドを使う。引数を`date`とすることで時分秒が`23:59:59｀となる。

``` js
console.info(date.endOf('date').format()); // 2019-03-30T23:59:59+09:00
```

### 7日前の取得
7日前の取得は、基準となる日時から7日を引き算する。

``` js
console.info(date.subtract(7, 'day').format()); // 2019-03-23T23:58:59+09:00
```

### 7日後の取得
7日後の取得は、基準となる日時から7日を足し算する。

``` js
console.info(date.add(7, 'day').format()); // 2019-04-06T23:58:59+09:00
```

## フォーマット
自在にフォーマット可能。
ISO8601形式の文字列を返すメソッド`toISOString`やJSONで保存されたときの文字列(`toJSON`)を返すメソッドもあるがいずれもUTCになるので注意する。

``` js
console.info(dayjs('2019-01-25').format('[YYYY] YYYY-MM-DDTHH:mm:ssZ[Z]')); // YYYY 2019-01-25T00:00:00+09:00Z
```

### ISO8601形式の文字列を取得する
``` js
console.info(dayjs('2012-01-25T00:00:00+0900').toISOString()); // 2019-01-24T15:00:00.000Z
```

### JSONにしたときと同じ文字列を取得する
``` js
console.info(dayjs("2012-01-25T00:00:00+0900").toJSON()); // 2019-01-24T15:00:00.000Z
```

利用できるフォーマットの一覧はこちら  
https://github.com/iamkun/dayjs/blob/dev/docs/en/API-reference.md#list-of-all-available-formats

## 差分 - 経過時間、経過日数、残り時間、残り日数(カウントダウン)
`終わりの日時.diff(始まりの日時)`の形で経過時間、経過日数、残り時間、残り日数を求められる。終わりの日時と始まりの日時を逆にするとマイナスの値になる。

### 経過時間 / 残り時間(カウントダウン) 
経過時間、あるいは残り時間を取得するには`diff`メソッドを使う。
`diff`メソッドの第一引数には比較するDayjsオブジェクト、第二引数には日時の単位を指定する。  
基準となる`fromDate`、`toDate`は12時間30分の差があるものを比較する。

``` js
const fromDate = dayjs('2018-01-01T00:00:00');
const toDate   = dayjs('2018-01-01T12:30:00');
console.info(toDate.diff(fromDate, 'h')); // 12
```

### 経過日数 / 残り日数(カウントダウン)
経過日数、あるいは残り日数を取得する場合も`diff`メソッドを使う。
基準となる`fromDate`、`toDate`は1日と12時間の差があるものを比較する。
``` js
const fromDate2 = dayjs('2018-01-01T00:00:00');
const toDate2   = dayjs('2018-01-02T12:00:00');
console.info(dayjs(toDate2).diff(fromDate2, 'd')); // 1
```

## 比較 - 等しい、前、後、等しいまたは前、等しいまたは後
比較のためのメソッドが用意されている。
「等しいまたは前」、「等しいまたは後」の比較を行う場合は`dayjs/plugin/isSameOrBefore`、`dayjs/plugin/isSameOrAfter`プラグインを使う。  
なお、`clone`したDayjsオブジェクトは`isSame`で比較すれば等しいが、`===`で比較すれば等しくない。`add`や`subtract`のような日時演算をした結果も同様でイミュータブル(オブジェクト作成後に値が変わらない)であることが確認できる。

``` js
import dayjs from 'dayjs';

const referenceDate = dayjs('2019-03-27T23:59:59');
const specifiedDate = referenceDate.clone();
// AとBは等しい
console.info(referenceDate.isSame(specifiedDate)); // true
// cloneしたオブジェクト同士は同一ではない
console.info(referenceDate === specifiedDate); // false
// 演算をした結果も同一ではない
console.info(referenceDate.add(0) === referenceDate); // false

// AはBより前(未来)
console.info(dayjs('2019-03-27T23:59:59').isBefore(dayjs('2019-03-28T00:00:00'))); // true

// AはBより後(過去)
console.info(dayjs('2019-03-27T23:59:59').isAfter(dayjs('2019-03-27T23:59:58'))); // true

// AとBは等しい、または、AはBより前(未来)
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore)
console.info(dayjs('2019-03-27T23:59:59').isSameOrBefore(dayjs('2019-03-27T23:59:59'))); // true
console.info(dayjs('2019-03-27T23:59:59').isSameOrBefore(dayjs('2019-03-28T00:00:00'))); // true

// AとBは等しい、または、AはBより後(過去)
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);
console.info(dayjs('2019-03-27T23:59:59').isSameOrAfter(dayjs('2019-03-27T23:59:59'))); // true
console.info(dayjs('2019-03-27T23:59:59').isSameOrAfter(dayjs('2019-03-27T23:59:58'))); // true

// 単位を指定して比較
// 秒単位で比較すれば異なる
console.info(dayjs('2019-03-27T23:59:59').isSame(dayjs('2019-03-27T23:59:58')));      // false
// 分単位で比較すれば同じ
console.info(dayjs('2019-03-27T23:59:59').isSame(dayjs('2019-03-27T23:59:58'), 'm')); // true
```

## 相対日時 - 3分前、5時間前、1日前
TwitterやFacebookのようなSNSや、Yahoo速報やNewsPicksのようなメディアでは「3分前」「5時間前」「1日前」のような現在日時からの相対的な日時表記をしている。  
`dayjs/plugin/relativeTime`プラグインを使うことで相対日時を簡易に導入できる。  
ただし0秒から44秒経過は「数秒前」のようなロジックが決まっているので、自分たちのサイトでのルールと違う場合は独自に実装する必要がある。

``` js
import dayjs from 'dayjs';

import 'dayjs/locale/ja';
dayjs.locale('ja');

import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)

const referenceDate = dayjs('2019-03-27T23:59:59');
const specifiedDate = referenceDate.clone();
// fromメソッドで指定日時からの相対日時を表示する。現在日時からの相対日時ならfromNowメソッドがある
console.info(specifiedDate.from(referenceDate));                   // 数秒前
console.info(specifiedDate.subtract(45, 's').from(referenceDate)); // 1分前
console.info(specifiedDate.subtract(90, 's').from(referenceDate)); // 2分前
console.info(specifiedDate.subtract(45, 'm').from(referenceDate)); // 1時間前
console.info(specifiedDate.subtract(90, 'm').from(referenceDate)); // 2時間前
console.info(specifiedDate.subtract(22, 'h').from(referenceDate)); // 1日前
console.info(specifiedDate.subtract(36, 'h').from(referenceDate)); // 2日前
console.info(specifiedDate.subtract(26, 'd').from(referenceDate)); // 1ヶ月前
console.info(specifiedDate.subtract(46, 'd').from(referenceDate)); // 2ヶ月前
console.info(specifiedDate.subtract(11, 'M').from(referenceDate)); // 1年前
console.info(specifiedDate.subtract(18, 'M').from(referenceDate)); // 2年前
```

相対日時の範囲はこちら　　
https://github.com/iamkun/dayjs/blob/dev/docs/en/Plugin.md#relativetime

<!-- 月の日数 -->

<!-- 日付のCollectionを並び替える
もっとも近い日を調べる
2つの日付の間にある日を取得する
https://www.webprofessional.jp/date-fns-javascript-date-library/ -->

<!-- 時間を切り捨てる - truncatedTo
https://stackoverflow.com/questions/15130735/how-can-i-remove-time-from-date-with-moment-js -->

## 引数に使われる単位
|単位 | 短縮系| 説明 |
|---|---|---|
|year  |y|年  |
|month |m|月  |
|date  |短縮系なし|日  |
|day   |d|曜日(0が日曜、6が土曜)  |
|hour  |h|時間|
|minute|m|分|
|second|s|秒|
|millisecond|ms|ミリ秒|

## まとめ
- dayjsはMoment.jsの代替として十分使える
- dayjsを導入することでDateオブジェクトに比べてフォーマット、日時演算、比較、差分のような日時操作が扱いやすくなり、バグの少ないコーディングができる
- Dateオブジェクトと同様`month`は0から始まることに注意する
