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
.post-meta__link {
  text-decoration: none;
  color: #999;
  margin-right: 1rem;
}

.social {
  margin-top: 8px;
}
.social__list {
  list-style-type: none;
  padding: 0;
  margin: 8px 0;
  display: inline-flex;
}
.social__item {
  margin-right: 15px;
}
.fb-share-button .fb_iframe_widget {
  margin-top: 0;
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
        <router-link class="post-meta__link" :to="`/category/${category}/`">{{category}}</router-link>
      </span>
    </span>

    <div class="social">
      <ul class="social__list">
        <li class="social__item"><a href="https://b.hatena.ne.jp/entry/" class="hatena-bookmark-button" data-hatena-bookmark-layout="basic-counter" title="このエントリーをはてなブックマークに追加"><img src="https://b.st-hatena.com/images/v4/public/entry-button/button-only@2x.png" alt="このエントリーをはてなブックマークに追加" width="20" height="20" style="border: none;" /></a><script type="text/javascript" src="https://b.st-hatena.com/js/bookmark_button.js" charset="utf-8" async="async"></script></li>
        <li class="social__item"><a href="https://twitter.com/share?ref_src=twsrc%5Etfw" class="twitter-share-button" data-show-count="true">Tweet</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script></li>
      </ul>
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    hasLastUpdated() {
      if(this.lastUpdated === '') {
        return false;
      }
      return this.lastUpdated !== this.publishedDate;
    },
    lastUpdated() {
      if(this.$page.lastUpdated === undefined) {
        return '';
      }
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