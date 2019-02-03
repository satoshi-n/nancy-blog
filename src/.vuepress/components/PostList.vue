<style lang="scss" scoped>
.post-list {
  padding-left: 0;
  &__item {
    list-style-type: none;
  }
  &__title {
    border-bottom: none;
  }
  &__link {
    color: #666;
  }
  &__meta {
    color: #999;
    font-size: 0.8rem;
  }
}
</style>

<template>
  <ul class="post-list">
    <li class="post-list__item" v-for="post in posts">
      <h2 class="post-list__title">
        <a class="post-list__link" :href="post.path">{{post.title}}</a>
        <p class="post-list__meta">Published: <span class="post-list__date">{{ post.date }}</span></p>        
      </h2>
    </li>
  </ul>
</template>
<script>
export default {
  computed: {
    posts() {
      console.info(this.$site.pages);
      return this.$site.pages
        .filter(post => post.regularPath.startsWith("/_posts/"))
        .map(post => {
          const date = new Date(post.frontmatter.date);
          post.date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
          return post;
        })
        .sort(
          (a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
        );
    }
  }
};
</script>