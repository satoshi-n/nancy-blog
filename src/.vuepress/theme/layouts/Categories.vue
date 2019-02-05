<template>
  <div>
    <h2>カテゴリー一覧</h2>
    <ul>
      <li v-for="category in $categories.list">
        <a :href="category.path">{{category.name}}({{category.posts.length}})</a>
      </li>
    </ul>
  </div> 
</template>
