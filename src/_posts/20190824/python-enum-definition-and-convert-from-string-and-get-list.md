---
title: Python3.7でenumを定義し、文字列からEnumを生成する、Enumの値から文字列を取得する、一覧を取得する、振る舞いを持たせる
description: Python3.7でenumを定義し、文字列からEnumを生成する、Enumの値から文字列を取得する、一覧を取得する、振る舞いを持たせる
date: 2019-08-24
categories:
  - Python
permalink: /python-enum-definition-and-convert-from-string-and-get-list
---
# {{ $page.title }}


<PostMeta/>

HTTPリクエストで送られてくる文字列の取りうる値が決まっている。そういう場合に、サーバー側で取りうる値が限定されていることを示すために、文字列からEnum(列挙型)に変換したい。  また、レスポンスはEnumから文字列にして値を返したい。  
そこで、PythonにおいてEnumをどう扱えばいいか見ていく。  
なお、確認したPythonのバージョンはPython 3.7.3である。  
まずはEnumの定義と値の取得、比較を確認したあとに、一覧の取得方法、振る舞いの持たせ方を見ていく。  

## Enumの定義とname、value
Enumは`enum.Enum`を継承することで作成する。  
列挙されている値の左にある定数として定義しておきたいものが`name`、右の値が`value`でそれぞれ取得できる。  

``` py
from enum import Enum
class VehicleType(Enum):
    BICYCLE = "bicycle"
    CAR = "car"
    TRAIN = "train"
```

``` py
>>> VehicleType.BICYCLE.name
'BICYCLE'
>>> VehicleType.BICYCLE.value
'bicycle'
```

## Enumが等しいか確認する
Enumの値は他のEnumの値とは一致しないし、同じ文字列でも一致しない。  
同じEnum値のみ等しいとみなされる。  

``` py
>>> VehicleType.BICYCLE == VehicleType.CAR
False
>>> VehicleType.BICYCLE == 'BICYCLE'
False
>>> VehicleType.BICYCLE == VehicleType.BICYCLE
True
```

## 文字列からEnumを生成する
`bicycle`という文字列から`VehicleType.BICYCLE`というEnumを生成する。  
与えられた値がEnumに存在しない場合は`ValueError`例外をなげるようにした。  
もし例外を投げたくない場合は、デフォルト値をenumに用意しておく。  
  
``` py
from enum import Enum

class VehicleType(Enum):
    BICYCLE = "bicycle"
    CAR = "car"
    TRAIN = "train"

    @classmethod
    def value_of(cls, target_value):
        for e in VehicleType:
            if e.value == target_value:
                return e
        raise ValueError('{} は有効な乗り物の値ではありません'.format(target_value))
```

一致する文字列のEnumが存在すればそれを返すし、なければValueErrorを投げる。  
``` py
>>> VehicleType.value_of("bicycle")
<VehicleType.BICYCLE: 'bicycle'>
>>> VehicleType.value_of("nothing")
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<stdin>", line 10, in value_of
ValueError: nothing は有効な乗り物の値ではありません
```

## Enumのname一覧を取得する
`for 変数名 in enum名`でループして`name`にアクセスすることで名前の一覧を取得できる。 

``` py
>>> [e.name for e in VehicleType]
['BICYCLE', 'CAR', 'TRAIN']
```

## Enumのvalue一覧を取得する
`for 変数名 in enum名`でループして`value`にアクセスすることで値の一覧を取得できる。 

``` py
>>> [e.value for e in VehicleType]
['bicycle', 'car', 'train']
```

## Enumのvalueにクラスを持たせて、処理を各クラスに移譲する
Enumのvalueにはクラスを持たせることもできる。  
そのため、**if文を使わずにnameごとに異なるロジックを持たせる**ことができる。  
nameごとに演算結果を直接返すようにもできるし、クラスを返すようにもできる。  
以下は演算結果を返している。  

``` py
from enum import Enum
from abc import ABCMeta, abstractmethod


class Calculator(metaclass=ABCMeta):
    @classmethod
    @abstractmethod
    def calculate(cls):
        pass


class BicycleCalculator(Calculator):
    @classmethod
    def calculate(cls):
        return "自転車の所用時間の計算結果"


class CarCalculator(Calculator):
    @classmethod
    def calculate(cls):
        return "車の所用時間の計算結果"


class TrainCalculator(Calculator):
    @classmethod
    def calculate(cls):
        return "電車の所用時間の計算結果"


class VehicleType(Enum):
    bicycle = BicycleCalculator
    car = CarCalculator
    train = TrainCalculator

    @classmethod
    def calculate(cls, target_name):
        for e in VehicleType:
            if e.name == target_name:
                return e.value.calculate()
        raise ValueError('{} は有効な乗り物の値ではありません'.format(target_value))
```

``` py
>>> VehicleType.calculate('bicycle')
自転車の所用時間の計算結果
>>> VehicleType.calculate('car')
車の所用時間の計算結果
```

## 参考  
https://docs.python.org/ja/3/library/enum.html  
https://stackoverflow.com/questions/41407414/convert-string-to-enum-in-python  
https://stackoverflow.com/questions/24487405/enum-getting-value-of-enum-on-string-conversion  
https://stackoverflow.com/questions/29503339/how-to-get-all-values-from-python-enum-class/29503454  
https://www.notinventedhere.org/articles/python/how-to-use-strings-as-name-aliases-in-python-enums.html  