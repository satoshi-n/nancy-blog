<template>
    <ul>
        <li v-for="post in posts">
            <h2><a :href="post.path">{{post.title}}</a></h2>
        </li>
    </ul>
</template>
<script>
export default {
    computed: {
        posts() {
            return this.$site.pages
                .filter(post => post.regularPath.startsWith('/_posts/'))
                .sort((a, b) => new Date(b.frontmatter.date) - new Date(a.frontmatter.date));
        }
    }
}
</script>