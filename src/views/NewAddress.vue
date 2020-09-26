<template>
  <div class="new-address">
    <van-nav-bar
      :title="aid ? '编辑地址' : '新增地址'"
      left-text="返回"
      left-arrow
      :fixed="true"
      @click-left="onClickLeft"
    />

    <van-address-edit
      :area-list="areaList"
      show-postal
      :show-delete="!!aid"
      show-set-default
      :area-columns-placeholder="['请选择', '请选择', '请选择']"
      :address-info="addressInfo"
      @save="saveAddress"
      @delete="removeAddress"
    />
  </div>
</template>

<script>
import areaList from "../assets/js/arealist";
import { utils } from "../assets/js/utils";

export default {
  naem: "newAddress",
  data() {
    return {
      //省市区数据
      areaList,
      //地址数据初始值
      addressInfo: {
        id: "",
        name: "",
        tel: "",
        province: "",
        city: "",
        county: "",
        addressDetail: "",
        areaCode: "",
        postalCode: "",
        isDefault: false,
      },
      aid: "", //传入的地址id
    };
  },

  created() {
    //获取aid
    this.aid = this.$route.query.aid;

    //如果存在aid，则调用查询地址数据方法
    if (this.aid) {
      this.getAddressDataByAid();
    }
  },

  methods: {
    // 返回上一个跳转路径
    onClickLeft() {
      this.$router.go(-1);
      return;
    },

    //新增地址
    addnewAddress(content) {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      //如果没有token则跳转到登录页面
      if (!tokenString) {
        this.$dialog
          .confirm({
            message: "当前操作需要登录才能进行,是否前往登录？",
          })
          .then(() => {
            return this.$router.push({ name: "Login" });
          })
          .catch(() => {
            // on cancel
          });
      }

      //复制一份
      let address = Object.assign({}, content);
      // 删除请求接口不需要的参数
      delete address.id;
      delete address.country;
      //需要将isDefault的值转化为数值类型
      address.isDefault = Number(address.isDefault);

      address.appkey = this.appkey;
      address.tokenString = tokenString;

      //对传进来的参数进行序列化处理
      let data = utils.queryString(address);

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url: "/addAddress",
        data,
      })
        .then((result) => {
          this.$toast.clear();

          this.$toast(result.data.msg);
          if (result.data.code == 9000) {
            setTimeout(() => {
              this.$router.go(-1);
            }, 2000);
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //编辑地址
    editAddress(content) {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return this.$router.push({ name: "Login" });
      }

      //判断地址是否被修改
      let isModify = false;
      for (let key in this.addressInfo) {
        if (this.addressInfo[key] != content[key]) {
          //已经被修改
          isModify = true;
          break;
        }
      }

      if (isModify) {
        //发起修改地址请求

        //复制对象
        let addressData = Object.assign({}, content);
        delete addressData.country;
        delete addressData.id;
        addressData.aid = this.aid;

        addressData.tokenString = tokenString;
        addressData.appkey = this.appkey;
        addressData.isDefault = Number(addressData.isDefault);

        //序列化参数
        let data = utils.queryString(addressData);

        this.$toast.loading({
          message: "加载中...",
          forbidClick: true,
          duration: 0,
          loadingType: "spinner",
        });

        this.axios({
          method: "POST",
          url: "/editAddress",
          data,
        })
          .then((result) => {
            this.$toast.clear();

            this.$toast(result.data.msg);
            if (result.data.code == 30000) {
              setTimeout(() => {
                this.$router.push({ name: "Address" });
              }, 1000);
            }
          })
          .catch((err) => {
            this.$toast.clear();
          });
      } else {
        this.$router.push({ name: "Address" });
      }
    },

    //保存地址
    saveAddress(address) {
      if (this.aid) {
        //编辑地址
        this.editAddress(address);
      } else {
        this.addnewAddress(address);
      }
    },

    //根据aid查询地址数据
    getAddressDataByAid() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return this.$router.push({ name: "Login" });
      }

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "GET",
        url: "/findAddressByAid",
        params: {
          appkey: this.appkey,
          tokenString,
          aid: this.aid,
        },
      })
        .then((result) => {
          this.$toast.clear();

          if (result.data.code == 40000) {
            for (let key in this.addressInfo) {
              if (key == "id") {
                this.addressInfo[key] = result.data.result[0].aid;
                continue;
              }

              this.addressInfo[key] =
                key == "isDefault"
                  ? Boolean(result.data.result[0][key])
                  : result.data.result[0][key];
            }
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //删除地址
    removeAddress() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return this.$router.push({ name: "Login" });
      }

      //参数序列化
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        aid: this.aid,
      });

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url: "/deleteAddress",
        data,
      })
        .then((result) => {
          this.$toast.clear();

          this.$toast(result.data.msg);
          if (result.data.code == 10000) {
            setTimeout(() => {
              this.$router.push({ name: "Address" });
            }, 1000);
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },
  },
};
</script>

<style lang="less" >
.new-address {
  padding-top: 46px;
  .van-nav-bar .van-icon {
    color: #0b34ba;
  }
  .van-nav-bar__text {
    color: #0b34ba;
  }
  .van-nav-bar__title {
    font-weight: bold;
  }
  .van-switch--on {
    background-color: #0b34ba;
  }
  .van-button--danger {
    background-color: #0b34ba;
    border-color: #0b34ba;
  }
}
</style>