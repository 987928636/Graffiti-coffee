<template>
  <div class="my">
    <div class="my-bg" v-if="isLogin" :style="{backgroundImage: `url(${userInfo.userBg})`}">
      <van-uploader class="uploader-box" :after-read="upload" />
    </div>
    <div v-else class="my-bg" style="{backgroundImage:url('../images/payimg\ .jpg')}">
      <van-uploader v-if="isLogin" class="uploader-box" :after-read="upload" />
    </div>

    <div class="my-content">
      <div class="my-boxing">
        <div class="my-box" v-if="isLogin">
          <div class="my-img">
            <div class="img-box" :style="{backgroundImage: `url(${userInfo.userImg})`}"></div>
            <div class="my-info">
              <div class="nickname">{{userInfo.nickName}}</div>
              <div class="desc">{{userInfo.desc == '' ? '这个家伙很懒，什么都没留下...' : userInfo.desc}}</div>
            </div>
          </div>
        </div>

        <div class="my-box" v-else>
          <div class="my-img">
            <div class="img-box" style="{backgroundImage:url('../images/home.jpg')}"></div>
            <div class="my-info">
              <div class="nickname" @click="goLogin">未登录</div>
              <div class="desc">这个家伙很懒，什么都没留下...</div>
            </div>
          </div>
        </div>

        <div class="lists">
          <van-cell
            :title="item.title"
            :to="item.to"
            :icon="item.icon"
            size="large"
            is-link
            v-for="(item, index) in lists"
            :key="index"
          />
        </div>

        <van-cell class="help" title="帮助反馈" is-link icon="question-o
" @click="showPopup" />

        <van-cell class="out" title="退出登录" is-link icon="user-circle-o
  " @click="outLogin" />

        <van-popup v-model="show" round position="bottom" :style="{ height: '60%' }" closeable>
          <h3 class="help-title">帮助反馈</h3>
          <van-collapse v-model="activeNames">
            <van-collapse-item title="账号问题" name="1">
              <h4>Q：如何修改自己的账户信息？</h4>
              <p>改App使用的是手机账号，您可以在“我的”页面修改个人账号信息</p>
            </van-collapse-item>
            <van-collapse-item title="订单问题" name="2">
               <h4>Q：如何取消订单?</h4>
              <p>如果商家尚未接单，您可以在订单详情页通过“取消订单”功能进行取消;如果商家已接单，则需要您电话联系后由商家取消订单。</p>
            </van-collapse-item>
            <van-collapse-item title="其它问题" name="3" >
               <h4>Q：为什么图片上传失败?</h4>
              <p>图片上传有限制，如果超过系统规定的图片大小或者路径不对均不可上传</p>
            </van-collapse-item>
          </van-collapse>
        </van-popup>
      </div>
    </div>
  </div>
</template>

<script>
import "../../assets/less/my.less";
import { utils } from "../../assets/js/utils";

export default {
  data() {
    return {
      activeNames: ['1'],
      show: false,
      lists: [
        { title: "个人资料", to: { name: "Account" }, icon: "manager-o" },
        { title: "我的订单", to: { name: "Order" }, icon: "balance-list-o" },
        { title: "我的收藏", to: { name: "Like" }, icon: "star-o" },
        { title: "收货地址", to: { name: "Address" }, icon: "flag-o" },
        { title: "安全中心", to: { name: "Secure" }, icon: "bulb-o" },
      ],
      isLogin: false,
      userInfo: {},
      maxSize: 1 * 1024 * 1024,
    };
  },

  created() {
    this.getUserInfo();
  },

  methods: {
    //显示帮助反馈与否
    showPopup() {
      this.show = true;
    },

    //前往登录界面
    goLogin() {
      this.$router.push({ name: "Login" });
    },

    //查询用户信息
    getUserInfo() {
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
        url: "/findMy",
        params: {
          appkey: this.appkey,
          tokenString,
        },
      })
        .then((result) => {
          this.$toast.clear();

          if (result.data.code == "A001") {
            if (result.data.result.length > 0) {
              this.isLogin = true;
              this.userInfo = result.data.result[0];
            }
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //上传背景
    upload(file) {
      ('file :>> ', file);
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return;
      }

      //获取文件类型
      let type = file.file.type.split("/")[1];
      let imgTypes = ["png", "gif", "jpg", "jpeg"];
      if (imgTypes.indexOf(type) === -1) {
        this.$notify({
          message: "图片类型只支持" + imgTypes.join(","),
          color: "#fff",
          background: "#0C34BA",
        });

        return;
      }

      //大小
      if (this.maxSize < file.file.size) {
        this.$notify({
          message: "上传文件大小不能超过" + this.maxSize / 1024 + "KB",
          color: "#fff",
          background: "#0C34BA",
        });
        return;
      }

      //

      //获取base64
      let base64 = file.content.replace(/data:image\/[A-Za-z]+;base64,/, "");

      //参数序列化
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        imgType: type,
        serverBase64Img: base64,
      });

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url: "/updateUserBg",
        data,
      })
        .then((result) => {
          this.$toast.clear();

          if (result.data.code == "I001") {
            this.userInfo.userBg = result.data.userBg;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //退出登录
    outLogin() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        //
        // this.$toast.fail("请先登录");
        // let that = this;
        // setTimeout(function () {
        //   that.$router.push({ name: "Login" });
        // }, 2000);
        this.$dialog
          .confirm({
            title: "前往登录",
            message: "当前为未登录状态，是否前往登录页面？",
          })
          .then(() => {
            this.$router.push({ name: "Login" });
          })
          .catch(() => {
            // on cancel
          });
      } else {
        this.$toast.loading({
          message: "加载中...",
          forbidClick: true,
          duration: 0,
          loadingType: "spinner",
        });

        //对传进来的参数进行序列化处理
        let data = utils.queryString({
          appkey: this.appkey,
          tokenString,
        });

        this.axios({
          method: "POST",
          url: "/logout",
          data,
        })
          .then((result) => {
            this.$toast.clear();

            // this.$toast.success(result.data.msg);

            this.$dialog
              .confirm({
                title: "退出登录",
                message: "是否退出登录？",
              })
              .then(() => {
                localStorage.removeItem("CSTK");
                this.$router.go(0);
              })
              .catch(() => {
                // on cancel
              });
          })
          .catch((err) => {
            this.$toast.clear();
          });
      }
    },
  },
};
</script>