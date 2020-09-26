<template>
  <div class="account">
    <van-nav-bar title="个人资料" left-text="返回" left-arrow :fixed="true" @click-left="back" />

    <div class="account-bg"></div>

    <div class="list-box">
      <van-cell title="头像">
        <div class="avatar fr">
          <img class="auto-img" :src="userInfo.userImg" alt />
          <van-uploader class="uploader-box" :after-read="uploadUserImg" />
        </div>
      </van-cell>
      <van-cell title="用户id">
        <div class="fr">{{userInfo.userId}}</div>
      </van-cell>
      <van-cell title="手机号">
        <div class="fr">{{userInfo.phone}}</div>
      </van-cell>
      <van-cell title="昵称">
        <div class="fr">
          <input
            class="nickname"
            type="text"
            v-model="userInfo.nickName"
            @change="modifyUserInfo('nickName', '/updateNickName')"
          />
        </div>
      </van-cell>

      <div class="desc-box">
        <div class="desc-title">简介</div>
        <div>
          <textarea
            v-model="userInfo.desc"
            class="text-area"
            placeholder="这家伙很懒，什么都没有留下"
            @change="modifyUserInfo('desc', '/updateDesc')"
          ></textarea>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/less/account.less";
import { utils } from "../assets/js/utils";

export default {
  data() {
    return {
      userInfo: {},
      maxSize: 1 * 1024 * 1024, //图片的最大size
    };
  },

  created() {
    //调用获取个人资料方法
    this.getUserInfo();
  },

  methods: {
    //返回上一路由
    back() {
      this.$router.go(-1);
    },

    //获取个人资料
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
        url: "/findAccountInfo",
        params: {
          appkey: this.appkey,
          tokenString,
        },
      })
        .then((result) => {
          this.$toast.clear();
          //请求数据成功
          if (result.data.code == "B001") {
            this.userInfo = result.data.result[0];
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //上传头像
    uploadUserImg(file) {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return;
      }

      //获取上传文件类型
      //将字符串分割成数组
      let type = file.file.type.split("/")[1];
      //规定上传的图片格式
      let imgTypes = ["png", "gif", "jpg", "jpeg"];
      //如果上传图片类型不符
      //进行错误提示，return
      if (imgTypes.indexOf(type) === -1) {
        this.$notify({
          message: "图片类型只支持" + imgTypes.join(","),
          color: "#fff",
          background: "#0C34BA",
        });

        return;
      }

      //如果上传图片大小超出规定最大值
      //进行错误提示，return
      if (this.maxSize < file.file.size) {
        this.$notify({
          message: "上传文件大小不能超过" + this.maxSize / 1024 + "KB",
          color: "#fff",
          background: "#0C34BA",
        });
        return;
      }

      //使用正则替换
      //将上传图片路径转换为base64格式
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
        url: "/updateAvatar",
        data,
      })
        .then((result) => {
          this.$toast.clear();
          //如果请求成功
          //替换用户头像
          if (result.data.code == "H001") {
            this.userInfo.userImg = result.data.userImg;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //修改用户信息
    modifyUserInfo(key, url) {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return;
      }

      //参数序列化
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        [key]: this.userInfo[key],
      });

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url,
        data,
      })
        .then((result) => {
          this.$toast.clear();
          this.$toast(result.data.msg);
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },
  },
};
</script>