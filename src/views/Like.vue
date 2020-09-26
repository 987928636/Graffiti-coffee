<template>
  <div class="like">
    <van-nav-bar title="我的收藏" left-text="返回" left-arrow :fixed="true" @click-left="back" />
    <div class="like-bg"></div>
    <div class="like-box">
      <div class="product-box clearfix" v-if="likeData.length > 0">
        <div
          class="product-item fl"
          :class="[index % 2 == 0 ? 'p-left' : 'p-right']"
          v-for="(item, index) in likeData"
          :key="index"
        >
          <div class="p-img" @click="viewProductInfo(item.pid)">
            <img class="auto-img" :src="item.smallImg" alt />
          </div>
          <div class="pro-name one-text">{{item.name}}</div>
          <div class="clearfix">
            <div class="pro-price fl">￥{{item.price}}</div>
            <div class="pro-remove fr" @click="removeLike(item.pid, index)">
              <van-icon name="like" color="#0C34BA" />
            </div>
          </div>
        </div>
      </div>
      <div v-else>
        <van-empty description="收藏商品空空如也，去逛一逛!">
          <van-button round color="#0C34BA" class="bottom-button" @click="goMenu">去逛一逛</van-button>
        </van-empty>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/less/like.less";

import { utils } from "../assets/js/utils";

export default {
  data() {
    return {
      //我的收藏商品数据
      likeData: [],
    };
  },

  created() {
    //查询我的收藏商品数据
    this.getAllLikeData();
  },

  methods: {
    //获取我的收藏商品数据
    getAllLikeData() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        this.$dialog
          .confirm({
            message: "当前操作需要登录才能进行，是否立即前往登录页面",
          })
          .then(() => {
            this.$router.push({ name: "Login" });
          })
          .catch(() => {
            // on cancel
          });
      }

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "GET",
        url: "/findAllLike",
        params: {
          appkey: this.appkey,
          tokenString,
        },
      })
        .then((result) => {
          this.$toast.clear();
          //如果请求成功
          if (result.data.code == 2000) {
            //将请求到的数据赋值给收藏数据
            this.likeData = result.data.result;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //查看商品详情
    viewProductInfo(pid) {
      this.$router.push({ name: "Detail", query: { pid } });
    },

    //删除收藏商品数据
    //pid: 商品id
    //index: 下标
    removeLike(pid, index) {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        this.$dialog
          .confirm({
            message: "当前操作需要登录才能进行，是否立即前往登录页面",
          })
          .then(() => {
            this.$router.push({ name: "Login" });
          })
          .catch(() => {
            // on cancel
          });
      }

      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        pid,
      });

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url: "/notlike",
        data,
      })
        .then((result) => {
          this.$toast.clear();
          //如果没有登录，前往登录页面
          if (result.data.code == 700) {
            return this.$router.push({ name: "Login" });
          }
          //取消收藏
          if (result.data.code == 900) {
            this.$dialog
              .confirm({
                message: "是否取消收藏当前商品？",
              })
              .then(() => {
                this.likeData.splice(index, 1);
                this.$toast.success("取消成功");
              })
              .catch(() => {
                // on cancel
              });
          } else {
            this.$toast.fail("取消失败");
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //跳转到菜单页面
    goMenu() {
      return this.$router.push({ name: "Menu" });
    },
    //返回上一个路由路径
    back() {
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="less" scoped>
</style>