<template>
  <div class="pay">
    <div class="bg">
      <van-nav-bar
        title="提交订单"
        left-text="返回"
        left-arrow
        :fixed="true"
        :border="false"
        @click-left="back"
      />
    </div>
    <div class="address-box">
      <div class="address">
        <div class="clearfix" @click="openAddressBox">
          <div class="fl address-title">选择收货地址</div>
          <div class="fl arrow-box">
            <van-icon name="arrow" class="arrow-icon" />
          </div>
        </div>
        <div class="address-content">
          <div class="clearfix">
            <div class="fl name">{{currentAddress.name}}</div>
            <div class="fl phone">{{currentAddress.tel}}</div>
          </div>
          <div class="address-info">{{currentAddress.address}}</div>
        </div>
      </div>
    </div>

    <div class="order-info">
      <div class="order-box">
        <div class="order-title">订单信息</div>

        <div>
          <div class="clearfix cell-box" v-for="(item, index) in shopbagData" :key="index">
            <div class="fl pro-img">
              <img class="auto-img" :src="item.small_img" alt />
            </div>
            <div class="fl pro-info">
              <div class="text-box">
                <div class="clearfix">
                  <div class="fl text-name">{{item.name}}</div>
                  <div class="fl text-rule">{{item.rule}}</div>
                </div>
                <div class="text-enname">{{item.enname}}</div>
              </div>
              <div class="price-box">
                <div class="fl price">￥{{item.price}}</div>
                <div class="fr count">x{{item.count}}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="pro-box">
          <div class="clearfix pro-boxing">
            <div class="fl pro-count">共计 {{product.count}} 件商品</div>
            <div class="fr pro-total">合计 ￥{{product.total}}</div>
          </div>
          <div class="left-box left"></div>
          <div class="left-box right"></div>
        </div>
      </div>
    </div>

    <div class="pay-btn">
      <van-button round block color="#0C34BA" @click="pay">立即结算</van-button>
    </div>

    <van-popup v-model="isOpen" position="bottom" closeable>
      <div class="address-title-box">选择收货地址</div>
      <van-address-list
        v-model="chosenAddressId"
        :list="list"
        default-tag-text="默认"
        @select="selectAddress"
        @add="newAddress"
      />
    </van-popup>

    <!-- 优惠券单元格 -->
    <van-coupon-cell :coupons="coupons" :chosen-coupon="chosenCoupon" @click="showList = true" />
    <!-- 优惠券列表 -->
    <van-popup v-model="showList" round position="bottom" style="height: 90%; padding-top: 4px;">
      <van-coupon-list
        :coupons="coupons"
        :chosen-coupon="chosenCoupon"
        :disabled-coupons="disabledCoupons"
        @change="onChange"
        @exchange="onExchange"
      />
    </van-popup>
  </div>
</template>

<script>
const coupon = {
  available: 1,
  condition: "无使用门槛\n最多优惠12元",
  reason: "",
  value: 150,
  name: "优惠券名称",
  startAt: 1489104000,
  endAt: 1514592000,
  valueDesc: "1.5",
  unitDesc: "元",
};
import "../assets/less/pay.less";
import { utils } from "../assets/js/utils";
export default {
  data() {
    return {
      showList: false,
      chosenCoupon: -1,
      coupons: [coupon],
      disabledCoupons: [coupon],

      isOpen: false,
      chosenAddressId: "",
      //地址列表数据
      list: [],
      //选择地址数据
      currentAddress: {
        name: "",
        tel: "",
        address: "",
      },
      //购物袋数据
      shopbagData: [],

      product: {
        count: 0,
        total: 0,
      },

      sids: [],

      payData: [], // 要结算的商品数据
    };
  },

  created() {
    this.sids = this.$route.query.sids.split("-");

    this.getReceiveAddress();

    this.getShopbagDataBySids();
  },

  methods: {
    onChange(index) {
      this.showList = false;
      this.chosenCoupon = index;
      //将优惠劵的金额/100
      let discounts = this.coupons[0].value / 100;

      //使用优惠劵
      this.product.total -= discounts;
    },
    onExchange(code) {
      this.coupons.push(coupon);
    },

    //返回上一级
    back() {
      this.$router.go(-1);
    },

    //显示选择收货地址
    openAddressBox() {
      this.isOpen = true;
    },

    //选择地址
    selectAddress(item, index) {
      this.isOpen = false;

      for (let key in this.currentAddress) {
        this.currentAddress[key] = item[key];
      }
    },

    //新增地址
    newAddress() {
      this.$router.push({ name: "NewAddress" });
    },

    //查询收货地址
    getReceiveAddress() {
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
        url: "/findAddress",
        params: {
          appkey: this.appkey,
          tokenString,
        },
      })
        .then((result) => {
          this.$toast.clear();

          if (result.data.code == 20000) {
            result.data.result.map((v) => {
              let address = v.province + v.city + v.county + v.addressDetail;
              this.list.push({
                id: v.aid,
                name: v.name,
                tel: v.tel,
                address,
                isDefault: Boolean(v.isDefault),
              });

              if (Boolean(v.isDefault)) {
                (this.chosenAddressId = v.aid),
                  (this.currentAddress.name = v.name);
                this.currentAddress.tel = v.tel;
                this.currentAddress.address = address;
              }
            });
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //根据sids查询购物袋数据
    getShopbagDataBySids() {
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
        url: "/commitShopcart",
        params: {
          appkey: this.appkey,
          tokenString,
          sids: JSON.stringify(this.sids),
        },
      })
        .then((result) => {
          this.$toast.clear();

          if (result.data.code == 50000) {
            this.payData = result.data.result;
            result.data.result.map((v) => {
              this.product.count += v.count;
              this.product.total += v.count * v.price;
            });

            this.shopbagData = result.data.result;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //立即结算
    pay() {
      //判断是否选择地址
      if (this.chosenAddressId == "") {
        this.$toast("请选择收货地址");
        return;
      }

      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return;
      }

      //参数序列化
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        sids: JSON.stringify(this.sids),
        phone: this.currentAddress.tel,
        address: this.currentAddress.address,
        receiver: this.currentAddress.name,
      });

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url: "/pay",
        data,
      })
        .then((result) => {
          this.$toast.clear();

          if (result.data.code == 60000) {
            if (this.payData.length > 0) {
              this.$toast(result.data.msg);
              //将使用了优惠劵后的价格传递到订单页面

              // this.$router.push({ name: "Order",query: { total: this.product.total }  });
              this.$router.push({ name: "Order" });
            } else {
              this.$dialog
                .confirm({
                  message: "当前结算的商品数量为零，是否前往购物车添加",
                })
                .then(() => {
                  this.$router.push({ name: "Shopbag" });
                })
                .catch(() => {
                  // on cancel
                });
            }
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },
  },
};
</script>
