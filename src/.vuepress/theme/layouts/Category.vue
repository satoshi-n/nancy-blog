<template>
  <div>
    <h2>カテゴリー {{$route.meta.categoryName}}</h2>
    <ul>
      <li v-for="post in $category.posts">
        <a :href="post.path">{{post.title}}</a>
      </li>
    </ul>
  </div>
</template>
