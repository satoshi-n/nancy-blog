<template>
  <div>
    <h2>タグ {{$route.meta.tagName}}</h2>
    <ul>
      <li v-for="post in $tag.posts">
        <a :href="post.path">{{post.title}}</a>
      </li>
    </ul>
  </div>
</template>
