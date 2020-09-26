<template>
  <div class="main">
    <div>
      <!-- 使用keep-alive缓存不活动的组件实列,避免重复渲染 -->
      <keep-alive include="Home,Menu">
        <!-- 二级路由 -->
        <router-view />
      </keep-alive>
    </div>

    <van-tabbar route v-model="active" active-color="#0b34ba" inactive-color="#000">
      <van-tabbar-item
        v-for="(item,index) in tabbarData"
        :key="index"
        :to="item.url"
        :badge="item.bagCount == 0 ? '' : item.bagCount"
      >
        <span>{{item.title}}</span>
        <template #icon="props">
          <img :src="props.active ? item.icon.active : item.icon.inactive" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script>
export default {
  data() {
    return {
      active: 0,
      tabbarData: [
        {
          title: "首页",
          icon: {
            active: require("../assets/images/home_active.png"),
            inactive: require("../assets/images/home_inactive.png"),
          },
          url: {
            name: "Home",
          },
          bagCount: 0,
        },
        {
          title: "菜单",
          icon: {
            active: require("../assets/images/menu_active.png"),
            inactive: require("../assets/images/menu_inactive.png"),
          },
          url: {
            name: "Menu",
          },
          bagCount: 0,
        },
        {
          title: "购物车",
          icon: {
            active: require("../assets/images/shopbag_active.png"),
            inactive: require("../assets/images/shopbag_inactive.png"),
          },
          url: {
            name: "Shopbag",
          },
          bagCount: 0, // 徽标提示
        },
        {
          title: "我的",
          icon: {
            active: require("../assets/images/my_active.png"),
            inactive: require("../assets/images/my_inactive.png"),
          },
          url: {
            name: "My",
          },
          bagCount: 0,
        },
      ],
    };
  },

  created() {
    //查询购物袋的数目
    this.findShopbag();
  },

  methods: {
    //查询购物袋的数目
    findShopbag() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return;
      }

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "GET",
        url: "/findAllShopcart",
        params: {
          appkey: this.appkey,
          tokenString,
        },
      })
        .then((result) => {
          this.$toast.clear();
           
          //请求成功
          if (result.data.code == 5000) {
            //当前徽章标记数量等于获取到的购物车商品条数
            this.tabbarData[2].bagCount = result.data.result.length;
          } else {
            this.$toast(result.data.msg);
          }
        })
        .catch((err) => {
          this.$toast.clear();
           
        });
    },
  },
};
</script>

<style lang="less" scoped>
.main {
  padding-bottom: 50px;
}
.van-tabbar--fixed {
  font-weight: bold;
}
</style>