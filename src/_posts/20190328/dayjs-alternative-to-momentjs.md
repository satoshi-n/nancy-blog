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
そこでこの記事ではMoment.jsの代替となるdayjsを紹介する。

[[toc]]

## dayjsとは
[dayjs](https://github.com/iamkun/dayjs)(Star数19,872)とは、**日付操作を簡単にするJavaScriptのライブラリ**だ。Moment.jsのAPIと広く互換があり、gzip圧縮されたサイズは**2.71KBと軽量**なのが特徴だ。

<!-- ```
gzip -c filename.min.js | wc -c
``` -->

## インストール
dayjsが十分Moment.jsの代わりになり得るのか確認していく。  
まずはインストールして、業務で使いそうな機能を一つずつ見ていく。

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
ロケールを指定することで、月や曜日を表示することができる。
``` js
import dayjs from 'dayjs';

console.info(dayjs().format('月:MMMM 曜日:dddd 曜日短縮:ddd'));// 月:March 曜日:Tuesday 曜日短縮:Tue
// ロケールの指定
import 'dayjs/locale/ja';
dayjs.locale('ja');
console.info(dayjs().format('月:MMMM 曜日:dddd 曜日短縮:ddd'));// 月:3月 曜日:火曜日 曜日短縮:火
```

## パース - 現在日時、Dateオブジェクト、ISO 8601文字列、年月日の区切り文字の違い
引数なしで現在日時を生成することができる。  
dayjsの引数に年月日時分秒を直接渡すことはできないので、`new Date`を経由するか個別に`set`する。  
ISO 8601文字列もパースできる。  
`new Date`を使う場合、区切り文字により返される日時が違うが、dayjsは同じ日時が生成されるので安心できる。他にもUnix Timestampを引数に渡すこともできる。

``` js
import dayjs from 'dayjs';

// 現在日時
console.info(dayjs().format()); // 2019-03-26T20:36:46+09:00

// Dateオブジェクトで年月日時分秒を指定
// dayjsの引数に年月日時分秒を直接渡すことはできない
console.info(dayjs(2019, 3, 25, 19, 31, 59).format()); // TypeError: Cannot create property 'date' on number '2'
// Dateオブジェクトを通して年月日時分秒を渡すのはOK。ただし月は0から始まることを考慮する
console.info(dayjs(new Date(2019, 2, 25, 19, 31, 59)).format('')); // 2019-03-25T19:31:59+09:00

// ISO 8601文字列からDayjsオブジェクトを生成する
console.info(dayjs('2019-03-25T23:58:59.999Z').format()); // 2019-03-26T08:58:59+09:00

// new Dateでは年月日の区切り文字が違うと異なる日時が返されるが、dayjsは同じ日時が返される
console.info(new Date('2019-03-25'));       // 2019-03-25T00:00:00.000Z
console.info(new Date('2019/03/25'));       // 2019-03-24T15:00:00.000Z
console.info(dayjs('2019-03-25').format()); // 2019-03-25T00:00:00+09:00
console.info(dayjs('2019/03/25').format()); // 2019-03-25T00:00:00+09:00
```

## バリデーション
`Dayjs`オブジェクトとして有効か判定できる。  
ただし、以下の通りの結果なので、ユーザーが入力した日付が正しい形式か判定するのには使えない。  
`2019-02-29`が`true`になるので実在する日付かどうかの判定には使えない。  
`2019-02`や`2019-02-X`、`10000-01-01`が`true`になるので入力に年月日を期待している場合は使えない。  
`undefined`は`true`を返すが、`null`や空文字は`false`になるので注意する。  

``` js
import dayjs from 'dayjs';

console.info(dayjs('2019-02-29').format());  // 2019-03-01T00:00:00+09:00
console.info(dayjs('2019-02-29').isValid()); // true

console.info(dayjs('2019-02').format());  // 2019-02-01T00:00:00+09:00
console.info(dayjs('2019-02').isValid()); // true

console.info(dayjs('2019-02-X').format());  // 2019-02-01T00:00:00+09:00
console.info(dayjs('2019-02-X').isValid()); // true

console.info(dayjs('0000-01-01').format());  // 1900-01-01T00:00:00+09:00
console.info(dayjs('0000-01-01').isValid()); // true

console.info(dayjs('9999-12-31').format());  // 9999-12-31T00:00:00+09:00
console.info(dayjs('9999-12-31').isValid()); // true

console.info(dayjs('10000-01-01').format());  // 999-12-01T01:00:00+09:15
console.info(dayjs('10000-01-01').isValid()); // true

console.info(dayjs(undefined).format());  // 2019-03-26T20:23:13+09:00
console.info(dayjs(undefined).isValid()); // true

console.info(dayjs(null).format());  // Invalid Date
console.info(dayjs(null).isValid()); // false

console.info(dayjs('').format());  // Invalid Date
console.info(dayjs('').isValid()); // false

console.info(dayjs({}).format());  // Invalid Date
console.info(dayjs({}).isValid()); // false

console.info(dayjs([]).format());  // Invalid Date
console.info(dayjs([]).isValid()); // false
```

## 取得/設定 - JST、UTC、年月日時分秒の個別指定
簡単に年月日時分秒の取得/設定ができる。  
ただし、`month`は0から始まることを考慮する。また、`'2019-03-25T14:58:59Z'`のようなUTCの場合、`hour`がそのままの`14`にならないことに注意する。

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

``` js
import dayjs from 'dayjs';
import moment from 'moment-timezone';

// タイムゾーン確認
console.info(moment.tz.guess()); // Asia/Tokyo

// 取得
// 日本標準時(JST)
const jstDate = dayjs('2019-03-25T23:58:59+09:00');
console.info(jstDate.year());   // 2019
console.info(jstDate.month());  // 2
console.info(jstDate.date());   // 25
console.info(jstDate.day());    // 1
console.info(jstDate.hour());   // 23
console.info(jstDate.minute()); // 58
console.info(jstDate.second()); // 59

// 協定世界時(UTC)
const utcDate = dayjs('2019-03-25T14:58:59Z')
console.info(utcDate.year());   // 2019
console.info(utcDate.month());  // 2
console.info(utcDate.date());   // 25
console.info(utcDate.day());    // 1
console.info(utcDate.hour());   // 23
console.info(utcDate.minute()); // 58
console.info(utcDate.second()); // 59

// Zが末尾にない場合
const utcNoZDate = dayjs('2019-03-25T14:58:59');
console.info(utcNoZDate.year());   // 2019
console.info(utcNoZDate.month());  // 2
console.info(utcNoZDate.date());   // 25
console.info(utcNoZDate.day());    // 1
console.info(utcNoZDate.hour());   // 14
console.info(utcNoZDate.minute()); // 58
console.info(utcNoZDate.second()); // 59

// 年月日時分秒の個別指定
const settingDate = dayjs()
  .year(2018)
  .month(0)
  .date(1)
  .hour(12)
  .minute(35)
  .second(48);
console.info(settingDate.format()); // 2018-01-01T12:35:48+09:00
``` 

## 操作 - 月初、月末、先月、来月、時分秒の切り捨て、1日の終わり、7日前、7日後
`startOf`、`endOf`、`add`、`subtract`の引数に年月日時分秒を指定することでいずれの単位でも日時の演算ができる。
そのため、月初、月末や先月、来月、時分秒の切り捨てや1日の最後の時分秒、X日前、X日後を求めることができる。

``` js
import dayjs from 'dayjs';

const date = dayjs('2019-03-30T23:58:59+09:00');

// 月初
console.info(date.startOf('month').format()); // 2019-03-01T00:00:00+09:00
// 月末
console.info(date.endOf('month').format()); // 2019-03-31T23:59:59+09:00

// 先月
console.info(date.subtract(1, 'month').format()); // 2019-02-28T23:58:59+09:00
// 来月
console.info(date.add(1, 'month').format()); // 2019-04-30T23:58:59+09:00

// 時分秒を00:00:00にする(時分秒を切り捨てる、1日の始まり)
console.info(date.startOf('date').format()); // 2019-03-30T00:00:00+09:00
// 時分秒を23:59:59にする(1日の終わり)
console.info(date.endOf('date').format()); // 2019-03-30T23:59:59+09:00

// 7日前
console.info(date.subtract(7, 'day').format()); // 2019-03-23T23:58:59+09:00
// 7日後
console.info(date.add(7, 'day').format()); // 2019-04-06T23:58:59+09:00
```

指定できる単位はこちら  
https://github.com/iamkun/dayjs/blob/dev/docs/en/API-reference.md#list-of-all-available-units

## フォーマット
自在にフォーマット可能。
ISO8601形式の文字列を返すメソッド`toISOString`やJSONで保存されたときの文字列(`toJSON`)を返すメソッドもあるがいずれもUTCになるので注意する。

``` js
import dayjs from 'dayjs';

console.info(dayjs('2019-01-25').format('[YYYY] YYYY-MM-DDTHH:mm:ssZ[Z]')); // YYYY 2019-01-25T00:00:00+09:00Z

// ISO8601
console.info(dayjs('2012-01-25T00:00:00+0900').toISOString()); // 2019-01-24T15:00:00.000Z
// JSON
console.info(dayjs("2012-01-25T00:00:00+0900").toJSON()); // 2019-01-24T15:00:00.000Z
```
利用できるフォーマットの一覧はこちら  
https://github.com/iamkun/dayjs/blob/dev/docs/en/API-reference.md#list-of-all-available-formats

## 差分 - 経過時間、経過日数、残り時間、残り日数(カウントダウン)
`終わりの日時.diff(始まりの日時)`の形で経過時間、経過日数、残り時間、残り日数を求められる。終わりの日時と始まりの日時を逆にするとマイナスの値になる。

``` js
import dayjs from 'dayjs';

// 経過時間 / 残り時間(カウントダウン)
const fromDate = dayjs('2018-01-01T00:00:00');
const toDate   = dayjs('2018-01-01T12:30:00');
console.info(toDate.diff(fromDate, 'h')); // 12

// 経過日数 / 残り日数(カウントダウン)
const fromDate2 = dayjs('2018-01-01T00:00:00');
const toDate2   = dayjs('2018-01-02T12:00:00');
console.info(dayjs(toDate2).diff(fromDate2, 'd')); // 1
```

## 比較 - 等しい、前、後、等しいまたは前、等しいまたは後
比較のためのメソッドが用意されている。秒単位で比較するか、分単位で比較するかの単位も指定できる。  
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

## まとめ
- dayjsはMoment.jsの代替として十分使える
- dayjsを導入することでDateオブジェクトに比べてフォーマット、日時演算、比較、差分のような日時操作が扱いやすくなり、バグの少ないコーディングができる
- Dateオブジェクトと同様`month`は0から始まることに注意する
