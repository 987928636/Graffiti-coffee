<template>
  <div class="detail">
    <!-- NavBar 导航栏 -->
    <van-nav-bar title="商品详情" left-text="返回" left-arrow :fixed="true" @click-left="onClickLeft" />
    <!-- 商品详情图片 -->
    <div class="detail-box">
      <van-image :src="product.large_img">
        <template v-slot:loading>
          <van-loading type="spinner" size="20" />
        </template>
      </van-image>
      <div class="pro-name">
        <div>{{product.name}}</div>
      </div>
    </div>
    <!-- 商品详细信息 -->
    <div class="detail-info">
      <div class="rule-box">
        <div class="rule-item clearfix" v-for="(item, index) in product.rules" :key="index">
          <div class="fl rule-item-title">{{item.title}}</div>
          <div class="fl clearfix">
            <div
              class="fl rule-item-tag"
              :class="{active: v.isActive}"
              v-for="(v, i) in item.rules"
              :key="i"
              @click="toggleRule(v, index)"
            >{{v.title}}</div>
          </div>
        </div>
      </div>
      <!-- 商品描述 -->
      <div class="desc-box">
        <div class="desc-title">商品描述</div>
        <div class="desc-content">
          <div
            class="desc-text"
            v-for="(item, index) in product.desc"
            :key="index"
          >{{index + 1}}、{{item}}</div>
        </div>
      </div>
      <!-- 商品价格和数量 -->
      <div class="clearfix desc-price-count">
        <div class="fl price">￥{{product.price}}</div>
        <div class="fr count">
          <van-stepper v-model="count" theme="round" button-size="24" disable-input />
        </div>
      </div>
    </div>
    <!-- 底部商品导航 -->
    <van-goods-action>
      <van-goods-action-icon
        icon="shopping-cart"
        text="购物车"
        :badge="bagCount == 0 ? '' : bagCount"
        color="#999"
        @click="goShopbag"
      />
      <van-goods-action-icon
        icon="like"
        text="收藏"
        :color="isLike ? '#0C34BA' : '#999'"
        @click="likeAndNotLike"
      />
      <van-goods-action-button color="#6A91EC" text="加入购物车" @click="addShopbag" />
      <van-goods-action-button color="#0C34BA" text="立即购买" @click="purchaseNow" />
    </van-goods-action>
  </div>
</template>

<script>
import "../assets/less/detail.less";
import { utils } from "../assets/js/utils";

export default {
  data() {
    return {
      count: 0, // 商品数量
      pid: "", // 传入的商品id
      product: {}, // 商品详情数据
      isLike: false, // 收藏与否
      bagCount: 0, // 徽标提示
      sids: "", // 立即购买的参数
    };
  },

  created() {
    // 获取传递过来的商品pid
    this.pid = this.$route.query.pid;
    //根据商品pid获取商品数据
    this.getProductByPid();

    //查询商品是否被收藏
    this.findLike();

    //查询购物袋的数目
    this.findShopbag();
  },

  methods: {
    //回到购物袋页面
    goShopbag() {
      this.$router.push({ name: "Shopbag" });
    },

    //根据商品pid获取商品数据
    getProductByPid() {
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      this.axios({
        method: "GET",
        url: "/productDetail",
        //如果get请求，参数需要放在params, 如果是post请求,参数需要放在data
        params: {
          appkey: this.appkey,
          pid: this.pid,
        },
      })
        .then((result) => {
          this.$toast.clear();

          if (result.data.code == 600) {
            //处理商品描述数据
            //将字符串以换行符分割成字符串数组。
            result.data.result[0].desc = result.data.result[0].desc.split(/\n/);

            //需要将商品规格数据处理成如下
            /**
             * [
                {
                  title: '温度',
                  rules: [
                    {
                      title: '热',
                      isActive: false
                    }
                  ]
                }
              ]
            */
            let ruleItems = ["tem", "sugar", "cream", "milk"];
            let rulesData = [];
            ruleItems.map((v) => {
              // 如果匹配到的属性为空，则return
              if (result.data.result[0][v] == "") {
                return;
              }

              let rule = {
                title: result.data.result[0][v + "_desc"],
                rules: [],
              };

              // 将全糖/半糖 分割成字符串数组。
              let r = result.data.result[0][v].split("/");

              r.map((value, index) => {
                let o = {
                  title: value,
                  isActive: index == 0,
                };
                //将分割好的规格数据追加到rules空数组里
                rule.rules.push(o);
              });
              // 将处理好的商品规格对象追加到空数组里
              rulesData.push(rule);
            });
            // 将数组赋值给当前商品详情的规格
            result.data.result[0].rules = rulesData;
            // 重新初始化商品详情数据
            this.product = result.data.result[0];
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //切换商品规格
    toggleRule(v, index) {
      //如果当前规格是选中状态,则return
      if (v.isActive) {
        return;
      }
      // 获取到当前商品规格的数组
      let ruleData = this.product.rules[index].rules;
      //遍历数组,取消全部规格的选中状态
      for (let i = 0; i < ruleData.length; i++) {
        if (ruleData[i].isActive) {
          ruleData[i].isActive = false;
          break;
        }
      }
      //当前点击的商品规格改为选中状态
      v.isActive = true;
    },

    //查询商品是否被收藏
    findLike() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      //如果用户没有登录则不查询
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
        url: "/findlike",
        params: {
          appkey: this.appkey,
          tokenString,
          pid: this.pid,
        },
      })
        .then((result) => {
          this.$toast.clear();

          //查询收藏商品成功
          if (result.data.code == 1000) {
            if (result.data.result.length != 0) {
              //当前收藏状态改为true
              this.isLike = true;
            } else {
              this.isLike = false;
            }
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //收藏
    likeAndNotLike() {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      //对传进来的参数进行序列化处理
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        pid: this.pid,
      });

      //根据this.isLike请求不同的接口
      //如果当前状态为收藏状态再请求取消收藏接口,否则反之
      let url = this.isLike ? "/notlike" : "/like";

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

          //如果未登录状态,则跳转到登录页面
          if (result.data.code == 700) {
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

          //收藏
          if (result.data.code == 800) {
            //
            this.isLike = true;
          } else if (result.data.code == 900) {
            // 取消收藏
            this.isLike = false;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

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
            this.bagCount = result.data.result.length;
          } else {
            this.$toast(result.data.msg);
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //加入购物袋
    addShopbag() {
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

      //获取当前商品选择的规格
      let rules = this.product.rules;

      let rule = [];
      //匹配当前选中的商品规格
      rules.map((v) => {
        for (let i = 0; i < v.rules.length; i++) {
          if (v.rules[i].isActive) {
            rule.push(v.rules[i].title);
            break;
          }
        }
      });

      //序列化参数
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        pid: this.pid,
        count: this.count,
        rule: rule.join("/"), //将数组转换成字符串
      });

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url: "/addShopcart",
        data,
      })
        .then((result) => {
          this.$toast.clear();
          //
          this.sids = result.data.sid;
          //请求成功
          if (result.data.code == 3000) {
            this.$toast.success(result.data.msg);
            if (result.data.status == 1) {
              //累加徽章标记数量
              this.bagCount++;
            }
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //立即购买
    purchaseNow() {
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

            return;
          });
      } else {
        //调用加入购物车功能
        this.addShopbag();
        //延迟跳转
        setTimeout(() => {
          this.$router.push({ name: "Pay", query: { sids: this.sids } });
        }, 1000);
      }
    },

    // 返回上一个跳转路径
    onClickLeft() {
      this.$router.go(-1);
      return;
    },
  },
};
</script>
