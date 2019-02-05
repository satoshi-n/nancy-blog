<template>
  <div>
    <h2>タグ一覧</h2>
    <ul>
      <li v-for="tag in $tags.list">
        <a :href="tag.path">{{tag.name}}({{tag.posts.length}})</a>
      </li>
    </ul>
  </div> 
</template>
