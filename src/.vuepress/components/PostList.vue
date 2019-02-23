<style lang="scss" scoped>
.post-list {
  padding-left: 0;
  &__item {
    list-style-type: none;
  }
  &__title {
    border-bottom: none;
    padding-bottom: 0;
    margin-bottom: 0.8rem;
  }
  &__link {
    color: #666;
  }
  &__meta {
    margin-bottom: 3rem;
    font-size: .8rem;
    color: #999;
  }
}
</style>

<template>
  <ul class="post-list">
    <li class="post-list__item" v-for="post in posts">
      <h2 class="post-list__title">
        <a class="post-list__link" :href="post.path">{{post.title}}</a>
      </h2>
      <p class="post-list__meta"><span class="post-list__date">{{ post.date }} 公開</span></p>
    </li>
  </ul>
</template>
<script>
export default {
  computed: {
    posts() {
      return this.$site.pages
        .filter(post => post.regularPath.startsWith("/_posts/"))
        .map(post => {
          console.info(post);
          const date = new Date(post.frontmatter.date);
          post.date = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
          return post;
        })
        .sort(
          (a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date)
        );
    }
  }
};
</script>