---
title: Composition APIでTypeScriptを使いv-modelで扱える簡易なフォームコンポーネントを作る
description: Composition APIでTypeScriptを使いv-modelで扱えるinput、textarea、checkbox、radio、selectを作る。nuxtjs/composition-apiを使っている。  
date: 2021-03-04
categories:
  - vue
permalink: /composition-api-typescript-form-component
---
# {{ $page.title }}

<PostMeta/>

Composition APIでTypeScriptを使って、フォームを作るサンプルコードを書いた。  
フォームのコンポーネントとしてinput[type=text]、textarea、checkbox、radio、selectの簡易なものを用意した。  
フォームのコンポーネントは親コンポーネントと子コンポーネント間のデータのやりとりがハマりどころだ。だから`v-model`が使えることを確認した。  
コンポーネント間でデータのやり取りが出来てさえしまえば後は項目を追加するだけなので、idやname、disabled、placeholderなどその他の項目は書いていない。  
  
親コンポーネントから以下のように使えるコンポーネントを作っていく。  
NuxtJSで試しているけど、`vuejs/composition-api`でも変わらないと思う。  

``` vue
<template>
  <div>
    <div>
      {{ form }}
    </div>
    <MyInput v-model="form.text" />
    <MyTextarea v-model="form.longText" />
    <MyCheckbox v-model="form.checked">check</MyCheckbox>
    <MyRadio v-model="form.picked" label="one">One</MyRadio>
    <MyRadio v-model="form.picked" label="two">Two</MyRadio>
    <MySelect v-model="form.selected" :options="options" />
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from '@nuxtjs/composition-api'

interface State {
  text: string
  longText: string
  checked: boolean
  picked: string
  selected: string
}

export default defineComponent({
  setup() {
    const form = reactive<State>({
      text: 'init text',
      longText: 'init long text',
      checked: false,
      picked: 'two',
      selected: 'b',
    })

    const options = [
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ]

    return {
      form,
      options,
    }
  },
})
</script>
```

## Input
inputタグでtype="text"の場合、props名`value`で値を渡し、`input`イベントで親コンポーネントへ変更を知らせる。  
`event.target`は`HTMLInputElement`として扱うことで`value`を取得できる。  

``` vue
<template>
  <input :value="value" type="text" @input="handleInput" />
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
  },
  emits: ['input'],
  setup(_, ctx) {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLInputElement
      ctx.emit('input', target.value)
    }

    return {
      handleInput,
    }
  },
})
</script>
```

## Textarea
textareaタグはinputタグでtype="text"と同様に、props名`value`で値を渡し、`input`イベントで親コンポーネントへ変更を知らせる。  
`event.target`は`HTMLTextAreaElement`として扱うことで`value`を取得できる。  

``` vue
<template>
  <textarea :value="value" @input="handleInput"></textarea>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
      type: [String, Number],
      default: '',
    },
  },
  emits: ['input'],
  setup(_, ctx) {
    const handleInput = (e: Event) => {
      const target = e.target as HTMLTextAreaElement
      ctx.emit('input', target.value)
    }

    return {
      handleInput,
    }
  },
})
</script>
```

## Checkbox
inputタグでtype="checkbox"の場合、props名`checked`で値を渡し、`change`イベントで親コンポーネントへ変更を知らせるようにした。  
`event.target`は`HTMLInputElement`として扱うことで`value`を取得できる。  
  
自作のコンポーネントは、デフォルトではprops名は`value`、親コンポーネントへ`input`イベントで変更を知らせようとする。  
  
> デフォルトではコンポーネントにある v-model は value をプロパティとして、input をイベントして使います
https://jp.vuejs.org/v2/guide/components-custom-events.html#v-model-%E3%82%92%E4%BD%BF%E3%81%A3%E3%81%9F%E3%82%B3%E3%83%B3%E3%83%9D%E3%83%BC%E3%83%8D%E3%83%B3%E3%83%88%E3%81%AE%E3%82%AB%E3%82%B9%E3%82%BF%E3%83%9E%E3%82%A4%E3%82%BA
  
props名と親コンポーネントへ変更を知らせるイベントを変更したい場合、`model`オプションを使う。  

``` vue
  model: {
    prop: 'checked',
    event: 'change',
  },
```

イベント名は変更したほうがハマりづらいのかなと思う。イベント名を変更しない場合、子コンポーネントで`@change`を使っているにも関わらず、親コンポーネントでは`@input`でイベントを受けないといけないからだ。  


``` vue
<template>
  <label>
    <input :checked="checked" type="checkbox" @change="handleChange" />
    <slot></slot>
  </label>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  model: {
    prop: 'checked',
    event: 'change',
  },
  props: {
    checked: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['change'],
  setup(_, ctx) {
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      ctx.emit('change', target.checked)
    }

    return {
      handleChange,
    }
  },
})
</script>
```

## Radio
radioでは`label`propで選択肢の値を渡して、`value`で選択した値を渡すようにしている。checkboxも同様の仕組みにすればBoolean以外も扱える。  

``` vue
<template>
  <label>
    <input
      :value="label"
      :checked="label === value"
      type="radio"
      @change="handleChange"
    />
    <slot></slot>
  </label>
</template>

<script lang="ts">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  model: {
    event: 'change',
  },
  props: {
    value: {
      type: [Boolean, String, Number],
      default: '',
    },
    label: {
      type: [Boolean, String, Number],
      default: '',
    },
  },
  emits: ['change'],
  setup(_, ctx) {
    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement
      ctx.emit('change', target.value)
    }

    return {
      handleChange,
    }
  },
})
</script>
```

## Select
selectタグはprops名`value`で値を渡し、`change`イベントで親コンポーネントへ変更を知らせている。  
`event.target`は`HTMLSelectElement`として扱うことで、選択したオプション`selectedOptions`を取得できる。  

``` vue
<template>
  <select @change="handleChange">
    <option
      v-for="(option, index) in options"
      :key="index"
      :value="option.value"
      :selected="value === option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api'

interface LavelValue {
  lavel: string | number
  value: string | number
}

export default defineComponent({
  model: {
    event: 'change',
  },
  props: {
    value: { 
      type: [String, Number],
      default: '',
    },
    options: { 
      type: Array as PropType<LavelValue[]>, 
      default: () => [],
    },
  },
  emits: ['change'],
  setup(_, ctx) {
    const handleChange = (e: Event) => {
      const target = e.target as HTMLSelectElement
      ctx.emit('change', target.selectedOptions[0].value)
    }

    return {
      handleChange,
    }
  },
})
</script>
```

## 参考
https://jp.vuejs.org/v2/guide/forms.html  
https://element-plus.org/  
https://qiita.com/wakame_isono_/items/611e51ff965d698bbc7c  

## 関連記事
[Nuxt Composition APIでv2との書き方の違いを確認した](https://nansystem.com/nuxt-composition-api-v2-diff/)  
[Vue.jsのinputイベントがselectタグで発火しない(Internet Explorer 11)原因と対応](https://nansystem.com/input-event-do-not-fire-for-select-tag-in-internet-explorer/)  
