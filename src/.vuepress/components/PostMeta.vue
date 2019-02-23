<style lang="scss" scoped>
.post-meta {
  margin-bottom: 1.5rem;
}
.post-meta__date {
  font-size: 0.8rem;
  color: #999;
}
.post_meta__date-divider {
  padding: 0 0.8rem;
}
.post-meta__categories {
  margin-left: 2rem;
  font-size: .8rem;
  color: #999;
}
</style>

<template>
  <div class="post-meta">
    <span class="post-meta__date">
      <template v-if="hasLastUpdated">
        <span class="post-meta__last-update-date">{{ lastUpdated }} 更新</span>
        <span class="post_meta__date-divider">|</span>
      </template>
      <span class="post-meta__published-date">{{ publishedDate }} 公開</span>
    </span>
    <span class="post-meta__categories">
      <span v-for="category in $page.frontmatter.categories">
        {{ category }}
      </span>
    </span>
  </div>
</template>

<script>
export default {
  computed: {
    hasLastUpdated() {
      return this.lastUpdated !== this.publishedDate;
    },
    lastUpdated() {
      const date = new Date(this.$page.lastUpdated);
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    },
    publishedDate() {
      const date = new Date(this.$page.frontmatter.date);
      return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    }
  }
};
</script>