<style lang="scss" scoped>
.profile {
  max-width: 740px;
  margin: 0 auto;
  padding: 1rem;
  border-top: 1px solid rgba(0,0,0,.05);
}
.profile__image {
  margin-right: 2rem;
}
.profile__title {
  margin: 0 0 1rem;
  font-size: 1.2em;
}
.profile__detail {
  display: flex;
}
.profile__name {
  font-size: 1.5em;
  margin: 0;
  line-height: 1.2;
}
.profile__job {
  font-size: 0.9em;
  margin: 0;
}
.profile__description {
  margin-bottom: 0;
}
.profile__sns {
  list-style-type: none;
  padding: 0;
}
@media (max-width: 739px) {
  .profile__image {
    margin-right: 0;
    margin-bottom: 1rem;
  }
  .profile__detail{
    flex-flow:column;
    justify-content: center;
    align-items: center;
  }
  .profile__name {
    text-align: center;
  }
  .profile__job {
    text-align: center;
  }
}
</style>

<template>
  <div class="profile">
    <p class="profile__title">この記事の著者</p>
    <div class="profile__detail">
      <img class="profile__image" src="./profile.svg" width="120" height="120" alt="nancy">
      <div class="profile__intro">
        <p class="profile__name">なんしー</p>
        <p class="profile__job">フリーランスのWebプログラマー</p>
        <p class="profile__description">
          Vue.jsでSPA開発をしています。このサイトでは主にwebpack、JavaScript、CSS、Vue.js、Python、Google Cloudの記事を書いています。
        </p>
        <ul class="profile__sns">
          <li class="profile__sns-item">
            twitter: <a href="https://twitter.com/nan_system">@nan_system</a>
          </li>
          <li class="profile__sns-item">
            GitHub:  <a href="https://github.com/nansystem">nansystem</a>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>
