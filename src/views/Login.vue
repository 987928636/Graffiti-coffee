<template>
  <div class="login">
    <div class="login-box">
      <van-nav-bar @click-right="goHome">
        <template #left>
          <div class="left-text">
            <div class="logo"></div>
            <div class="logo-title">Graffiti Coffee</div>
          </div>
        </template>
        <template #right>
          <div>
            <van-icon name="weapp-nav" />
          </div>
        </template>
      </van-nav-bar>

      <div class="login-form">
        <div class="title">欢迎回来！</div>
        <div class="en-title">Pleace login to your accounts</div>
        <div class="login-form-box">
          <van-form>
            <van-field name="用户名" label="用户名" placeholder="请输入您的用户名" v-model="userLoginInfo.phone"  autocomplete="off"/>
            <van-field
              :type="isPassword?'password':'text'"
              name="密码"
              label="密码"
              placeholder="请输入您的密码"
              v-model="userLoginInfo.password"
              :right-icon="isPassword?
              'closed-eye':'eye-o'"
              @click-right-icon="viewPassword"
            />
            <div class="forgot clearfix">
              <span class="fr"  @click="goForgot">忘记密码？</span>
            </div>
            <div class="login-btn">
              <van-button round block type="info" native-type="submit" @click="login">登 录</van-button>
            </div>
            <div class="login-btn">
              <van-button round block type="default" @click="openRegister">注 册</van-button>
            </div>
          </van-form>
        </div>
      </div>
    </div>
    <van-popup v-model="isRegister" round closeable position="bottom" :style="{ height: '60%' }">
      <div class="register_title">注册</div>
      <div class="register-form-box">
        <van-form>
          <van-field label="手机号" placeholder="11位手机号" v-model="userRegisterInfo.phone" />
          <van-field label="昵称" placeholder="1-10位昵称" v-model="userRegisterInfo.nickName" />
          <van-field
            :type="isPassword ? 'password' : 'text'"
            label="密码"
            placeholder="6-16位密码且以字母开头"
            v-model="userRegisterInfo.password"
            :right-icon="isPassword ? 'closed-eye' : 'eye-o'"
            @click-right-icon="viewPassword"
          />
          <div class="login-btn">
            <van-button
              round
              block
              type="info"
              native-type="submit"
              @click="register"
            >注&nbsp;&nbsp;册</van-button>
          </div>
        </van-form>
      </div>
    </van-popup>
  </div>
</template>

<script>
// 样式
import "../assets/less/login.less";
// 表单验证
import { validForm } from "../assets/js/validForm";
// 请求接口
import { utils } from "../assets/js/utils";
export default {
  data() {
    return {
      //登录信息
      userLoginInfo: {
        phone: "",
        password: "",
      },

      //注册信息
      userRegisterInfo: {
        phone: "",
        nickName: "",
        password: "",
      },

      //是否隐藏密码
      isPassword: true,
      //隐藏注册页面
      isRegister: false,
    };
  },

  methods: {
    //跳转到首页
    goHome() {
      this.$router.push({ name: "Home" });
    },

    //切换显示与隐藏密码
    viewPassword() {
      this.isPassword = !this.isPassword;
    },

    //弹出注册页面
    openRegister() {
      this.isRegister = true;
    },

    //注册账号
    register() {
      //获取用户注册信息
      let userInfo = this.userRegisterInfo;

      //验证注册表单
      let o = {
        phone: {
          value: userInfo.phone,
          reg: /^1[3-9]\d{9}$/,
          errorMsg: "手机号格式不正确",
        },
        nickName: {
          value: userInfo.nickName,
          reg: /^[\w\u4e00-\u9fa5]{1,10}$/,
          errorMsg: "昵称格式不正确",
        },
        password: {
          value: userInfo.password,
          reg: /^[A-Za-z]\w{5,15}$/,
          errorMsg: "密码格式不正确",
        },
      };

      //验证不通过
      if (!validForm.valid(o)) {
        return;
      }

      //验证通过
      //开启加载提示
      this.$toast.loading({
        message: "加载中...",
        //防止穿透
        forbidClick: true,
        //显示时间, 如果时间为0，则不会自动关闭
        duration: 0,
        //加载样式
        loadingType: "spinner",
      });

      //复制用户信息
      let info = Object.assign({}, userInfo);
      info.appkey = this.appkey;
      //序列化参数
      let data = utils.queryString(info);

      //发起请求
      this.axios({
        method: "POST",
        url: "/register",
        data,
      })
        .then((result) => {
          //关闭加载提示
          this.$toast.clear();
          //如果注册成功
          if (result.data.code == 100) {
            //隐藏注册页面
            this.isRegister = false;
            //顶部提示
            this.$notify({
              type: "success",
              message: result.data.msg,
            });
            //清空注册表单的数据
            for (let key in userInfo) {
              userInfo[key] = "";
            }
          } else {
            //如果注册失败,则提示错误信息
            this.$notify({
              type: "danger",
              message: result.data.msg,
            });
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //登录
    login() {
      let userInfo = this.userLoginInfo;

      let o = {
        phone: {
          value: userInfo.phone,
          reg: /^1[3-9]\d{9}$/,
          errorMsg: "手机格式不正确",
        },
        password: {
          value: userInfo.password,
          reg: /^[A-Za-z]\w{5,15}$/,
          errorMsg: "密码格式不正确",
        },
      };

      //验证表单
      if (!validForm.valid(o)) {
        return;
      }

      //验证通过
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      //复制userInfo
      let info = Object.assign({}, userInfo);
      info.appkey = this.appkey;

      //参数序列化
      let data = utils.queryString(info);

      this.axios({
        method: "POST",
        url: "/login",
        data,
      })
        .then((result) => {
          this.$toast.clear();
          //请求成功
          if (result.data.code == 200) {
            // 将 token 保存到本地存储中
            localStorage.setItem("CSTK", result.data.token);
            this.$router.push({ name: "Home" });
          } else {
            this.$notify({
              type: "danger",
              message: result.data.msg,
            });
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },
    //前往忘记密码页面
    goForgot() {
      this.$router.push({ name: "Forgot" });
    },
  },
};
</script>
