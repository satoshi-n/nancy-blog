---
title: Nuxt Composition APIでv2との書き方の違いを確認した
description: Vue v2とComposition APIでの違いを確認した。1つのコンポーネント内での違い(data, computed, methods, watch, created, mounted)と、親子のコンポーネント間の違い(v-model, prop, emit, sync)をコードを書いた
date: 2021-02-17
categories:
  - vue
permalink: /nuxt-composition-api-v2-diff
---
# {{ $page.title }}

<PostMeta/>

`Composition API`を使うことになったので、今までの書き方が`Composition API`ではどう書けばいいのか確認した。   
1つのコンポーネント内での違い(data, computed, methods, watch, created, mounted)と、親子のコンポーネント間の違い(v-model, prop, emit, sync)をコードを書いて確認している。  
  
プロジェクトでNuxtを使うことが多いので、`nuxt-app`でアプリケーションを初期化し、`@nuxtjs/composition-api`を入れて動かした。  

## 下準備
`npm init nuxt-app`でNuxtアプリケーションを作成した。  
cssフレームワークやlint、formatterはお好みでいれる。  
別途`@nuxtjs/composition-api`をインストールし、`nuxt.config.js`の`buildModules`に設定する。  

``` sh
$ npm init nuxt-app composition-api-example
$ cd composition-api-example
$ gibo dump Node VisualStudioCode >> .gitignore
$ npm run dev
```

``` sh
$ npm install @nuxtjs/composition-api --save
```

`nuxt.config.js`
``` js
{
  buildModules: [
    '@nuxtjs/composition-api',
    // 他...
  ]
}
```

## 1つのコンポーネント内での違い data, computed, methods, watch, created, mounted
  
今までは`data`プロパティや`methods`、`created`のようなライフサイクルフックなどそれぞれ分けて定義していたが、`Composition API`ではすべて`setup`関数の中で定義する。  

### data → ref, reactive
`data`は`Composition API`で`ref`あるいは`reactive`で表現される。  
`ref`はプリミティブな値を管理し、`reactive`はオブジェクトや配列を管理する。  
そのため、`reactive`の方が今までの使い方に近い。  
ただし、`ref`にオブジェクトや配列を渡すと、内部で`reactive`が呼ばれるため問題なく使える。 
  
次のコードは`data`を`reactive`で管理し、`title`を`ref`で管理している。  
`setTimeout`で`data`や`title`の値が変わったら、テンプレートの値も変わることを確認している。  

``` vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <ul>
      <li v-for="u in data.users" :key="u.id">{{ u.id }} {{ u.name }}</li>
    </ul>
  </div>
</template>

<script lang="js">
import { defineComponent, reactive, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const data = reactive({
      users: [
        { id: 1, name: '加藤かな' },
        { id: 2, name: '田中紘一' },
        { id: 3, name: '山田太郎' },
      ],
    })
    const title = ref("タイトル")

    setTimeout(() => {
      data.users.push({ id: 4, name: '新藤誠' })
      title.value = "タイトルが変更できること"
    }, 1000);

    return {
      data,
      title,
    }
  },
})
</script>
```

### computed → computed
`computed`(算出プロパティ)は`setup`関数のなかで呼び出す。  
今までは`this.users`のように`this`を経由してもとになる値を参照していたが、
`Composition API`では`setup`関数内に定義された変数をそのまま参照する。  
  
次のコードは`data.users`の件数をもとに`userNum`というユーザー件数を算出して表示できるようにしている。
``` vue
<template>
  <div>
    <p>ユーザー件数: {{ userNum }}</p>
  </div>
</template>

<script lang="js">
import { defineComponent, reactive, computed } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const data = reactive({
      users: [
        { id: 1, name: '加藤かな' },
        { id: 2, name: '田中紘一' },
        { id: 3, name: '山田太郎' },
      ],
    })
    const userNum = computed(() => data.users.length)
    return {
      data,
      userNum,
    }
  },
})
</script>
```

### methods → 普通の関数
`methods`は`computed`のような`Vue`独自の決まりにしたがって書く必要はなく普通の関数として書く。 
次のコードは「ユーザー追加」ボタンを押すと`data.users`にユーザを追加する`addUser`関数を定義している。

``` vue
<template>
  <div>
    <form @submit.prevent>
      <div>
        <label for="name">お名前</label>
        <input id="name" type="text" v-model="data.form.name">
      </div>    
      <div>
        <button @click="addUser">ユーザー追加</button>
      </div>
    </form>
    <div style="margin-top:16px;">
      <p>ユーザー件数: {{ userNum }}</p>
      <ul>
        <li v-for="u in data.users" :key="u.id">{{ u.id }} {{ u.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script lang="js">
import { defineComponent, reactive, computed, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const data = reactive({
      form: {
        name: '',
      },
      users: [
        { id: 1, name: '加藤かな' },
        { id: 2, name: '田中紘一' },
        { id: 3, name: '山田太郎' },
      ],
    })
    const userNum = computed(() => data.users.length)
    const addUser = () => {
      const id = Math.max(...data.users.map(u=>u.id)) + 1
      data.users.push({id: id, name: data.form.name})
      data.form.name = ''
    }

    return {
      data,
      addUser,
      userNum,
    }
  },
})
</script>
```

なお、今までの`data`は1つしかなかったが、`Composition API`では`reactive`の部分は1つにしなければいけないというルールはないため、2つ以上定義してもよい。
```
    const data = reactive({
      users: [
        { id: 1, name: '加藤かな' },
        { id: 2, name: '田中紘一' },
        { id: 3, name: '山田太郎' },
      ],
    })
    const form = reactive({
      name: '',
    })
```

### watch → watch, watchEffect
`watch`は`Composition API`で`watch`あるいは`watchEffect`で定義する。  
`watch`の方が今までと同じようにプロパティを監視して何らかの処理を実行できる。  
一方で`watchEffect`はプロパティを指定せず、第1引数に渡すコールバック関数で使われる値を監視して何らかの処理を実行する。  
ここでは明示的にプロパティを指定する`watch`を使う。  
  
次のコードは`watch`内の第1引数で監視するプロパティを指定し、第2引数でプロパティの値が変更された際の値を`console`に表示している。  
第2引数のコールバックは第1引数が変更後の値、第2引数が変更前の値になる。  

```　vue
<template>
  <div>
    <form @submit.prevent>
      <div>
        <label for="name">お名前</label>
        <input id="name" v-model="form.name" type="text" />
      </div>
      <div>
        <label for="email">email</label>
        <input id="email" v-model="form.email" type="text" />
      </div>
    </form>
  </div>
</template>

<script lang="js">
import { defineComponent, reactive, computed, ref, watch } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const form = reactive({
      name: '',
      email: '',
    })

    watch(
      () => form.name,
      (currentName, prevName) => {
        console.info('currentName: ', currentName, 'prevName: ', prevName)
      },
    )

    return {
      form,
    }
  },
})
</script>
```

オブジェクトの各プロパティを監視したい場合は第3引数に`{deep: true}`を追加する。
``` vue
    watch(
      () => form,
      (currentForm, prevForm) => {
        console.info('currentForm: ', currentForm, 'prevForm: ', prevForm)
      },
      { deep: true},
    )
```

### created → 普通の関数呼び出しとして書く
`created`は`computed`のような`Vue`独自の決まりにしたがって書く必要はなく普通の関数として書く。   
`created`はDOMを参照できないが、setup関数内の変数は参照することができるため、APIによる値の初期化などに使われる。  

次のコードはAPIで`data`を初期化するのを模倣して、`setTimeout`で3秒後に初期化されることを確認している。  

```vue
<template>
  <div>
    <div style="margin-top: 16px">
      <p>ユーザー件数: {{ userNum }}</p>
      <ul>
        <li v-for="u in data.users" :key="u.id">{{ u.id }} {{ u.name }}</li>
      </ul>
    </div>
  </div>
</template>

<script lang="js">
import { defineComponent, reactive, computed } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const data = reactive({
      users: [],
    })

    const userNum = computed(() => data.users.length)

    // created ... DOMにさわれることが保証されてない。APIからデータ取得する処理などを書く
    setTimeout(() => {
      data.users.push(...[
        { id: 1, name: '加藤かな' },
        { id: 2, name: '田中紘一' },
        { id: 3, name: '山田太郎' },
      ])
    }, 3000);

    return {
      data,
      userNum,
    }
  },
})
</script>
```

### mounted → onMounted
`mounted`は`Composition API`では`on`がつき、`onMounted`になった。  
`onMounted`はDOMを参照できる。    
DOMの参照は、今までは`this.$refs.emailInput`のように`this.$refs`で参照していた。  
しかし、`Composition API`では`ref(null)`で`setup`関数内に変数を用意しておいて、
テンプレートで`ref`によりその変数と紐づけをすることでDOMを参照できる。  

次のコードはメールアドレスの`input`タグにフォーカスが当たるようにしている。  

``` vue
<template>
  <div>
    <form @submit.prevent>
      <div>
        <label for="email">email</label>
        <input ref="emailInput" id="email" type="text" />
      </div>
    </form>
  </div>
</template>

<script lang="js">
import { defineComponent, reactive, onMounted, ref } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const emailInput = ref(null);

    onMounted(()=>{
      // composition api以前は this.$refs.emailInputのような形で取得していた
      emailInput.value.focus()
    })
    console.info("before mount", emailInput.value)

    return {
      emailInput,
    }
  },
})
</script>
```

## 親子のコンポーネント間の違い - v-model, prop, emit, sync
### props → props
親コンポーネントから子コンポーネントへの渡し方は`:users="data.users"`のように渡す。親コンポーネントは`Composition API`による違いはない。  
  
子コンポーネントで`props`の値を使って何らかの処理をするには`setup`の第1引数から`props`を取得して操作するようになっている。   
  
次のコードは親コンポーネント`index.vue`から子コンポーネント`UserList.vue`へユーザーの一覧を渡して表示している。  
子コンポーネント`UserList.vue`では`setup`関数内で`props`でわたってきたユーザーの一覧からユーザー数を算出している。  
  
親コンポーネント`index.vue`  
``` vue
<template>
  <div>
    <UserList :users="data.users" />
  </div>
</template>

<script lang="js">
import { defineComponent, reactive } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const data = reactive({
      users: [
        { id: 1, name: '加藤かな' },
        { id: 2, name: '田中紘一' },
        { id: 3, name: '山田太郎' },
      ],
    })

    setTimeout(() => {
      data.users.push({ id: 4, name: '木下武' })
    }, 3000);

    return {
      data
    }
  },
})
</script>
```
  
子コンポーネント`UserList.vue`  
```vue
<template>
  <div>
    <p>ユーザー件数: {{ userNum }}</p>
    <ul>
      <li v-for="u in users" :key="u.id">{{ u.id }} {{ u.name }}</li>
    </ul>
  </div>  
</template>

<script lang="js">
import { defineComponent, computed } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    users: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const userNum = computed(() => props.users.length)
    return {
      userNum
    }
  },
})
</script>
```

### v-model → v-model, this.$emit → context.emit
親コンポーネントから子コンポーネントへ値を渡し、子コンポーネントから親コンポーネントへ変化した値を返すには、親コンポーネントで`v-model="値"`のようにする。親コンポーネントは`Composition API`による違いはない。  
なお、Vueのv3では`v-model`の[破壊的変更](https://v3.vuejs.org/guide/migration/v-model.html)があるようだがこちらはふれない。  
  
子コンポーネントでは`input`タグのインラインで`$emit`する方法と、`setup`関数で`context.emit`する方法がある。前者は`Composition API`による違いはない。 後者は`setup`関数の第2引数から`context`を取得し`context.emit`する。第2引数を`setup(_, {emit})`のように分割代入して、`setup`関数内で`emit`単体で扱ってもよい。  
  
次のコードは親コンポーネント`index.vue`から子コンポーネント`InputName.vue`へ値を渡し、`InputName.vue`内の`input type="text"`で`input`イベントが起こるたびに親コンポーネントへ変化した値を渡している。  
`v-model`はinputのtypeごとに挙動が違い、ここではinputのtypeがtextの場合を示している。  
  
親コンポーネント`index.vue`  
```
<template>
  <div>
    <form @submit.prevent>
      <InputName v-model="form.name" />
    </form>
  </div>
</template>

<script lang="js">
import { defineComponent, reactive } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const form = reactive({
      name: '山田',
    })

    return {
      form
    }
  },
})
</script>
```

子コンポーネント`InputName.vue` inputタグでインラインに$emitする書き方  
``` vue
<template>
  <div>
    <label for="name">お名前</label>
    <input id="name" :value="value" @input="$emit('input', $event.target.value)" type="text" />
  </div>
</template>

<script lang="js">
import { defineComponent, toRefs, isRef } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true
    },
  },
})
</script>
```

子コンポーネント`InputName.vue` setup関数で`context.emit`する書き方
``` vue
<template>
  <div>
    <label for="name">お名前</label>
    <input id="name" :value="value" type="text" @input="updateValue" />
  </div>
</template>

<script lang="js">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true
    },
  },
  setup(_, context) {
    const updateValue = (e) => {
      context.emit('input', e.target.value)
    }
    return {
      updateValue
    }
  },
})
</script>
```

子コンポーネント`InputName.vue` setup関数で第2引数を分割代入して`emit`単体で扱う書き方(一部抜粋)  
``` vue
  setup(_, {emit}) {
    const updateValue = (e) => {
      emit('input', e.target.value)
    }
    return {
      updateValue
    }
  },
```

### .sync → .sync
親コンポーネントから子コンポーネントへ値を渡し、子コンポーネントから親コンポーネントへ変化した値を返すには、親コンポーネントで`v-model="値"`とする他に`:prop名.sync="値"`とも書ける。

子コンポーネントでは`@input="$emit('update:prop名', $event.target.value)"`あるいは`setup`関数で`emit('update::prop名', e.target.value)`のように書く。  

親コンポーネント`index.vue`  
``` vue
<template>
  <div>
    <form @submit.prevent>
      <InputName :value.sync="form.name" />
    </form>
  </div>
</template>

<script lang="js">
import { defineComponent, reactive } from '@nuxtjs/composition-api'

export default defineComponent({
  setup() {
    const form = reactive({
      name: '山田',
    })

    return {
      form
    }
  },
})
</script>
```

子コンポーネント`InputName.vue` inputタグでインラインに$emitする書き方  
```
<template>
  <div>
    <label for="name">お名前</label>
    <input
      id="name"
      :value="value"
      type="text"
      @input="$emit('update:value', $event.target.value)"
    />
  </div>
</template>

<script lang="js">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true
    },
  },
})
</script>
```

子コンポーネント`InputName.vue` setup関数でemitする書き方
``` vue
<template>
  <div>
    <label for="name">お名前</label>
    <input id="name" :value="value" type="text" @input="updateValue" />
  </div>
</template>

<script lang="js">
import { defineComponent } from '@nuxtjs/composition-api'

export default defineComponent({
  props: {
    value: {
      type: String,
      required: true
    },
  },
  setup(_, {emit}) {
    const updateValue = (e) => {
      emit('update:value', e.target.value)
    }
    return {
      updateValue
    }
  },
})
</script>
```

参考  
https://v3.vuejs.org/guide/composition-api-introduction.html#why-composition-api  
