<template>
  <div class="shopbag">
    <van-nav-bar
      title="购物车"
      left-text="返回"
      left-arrow
      :fixed="true"
      @click-left="onClickLeft"
      @click-right="editProduct"
    >
      <template #right v-if="shopbagData.length > 0">
        <div>{{isEdit ? '完成' : '编辑'}}</div>
      </template>
    </van-nav-bar>
    <div v-if="shopbagData.length > 0">
      <div class="shop-item">
        <van-swipe-cell
          class="clearfix"
          :disabled="!isEdit"
          v-for="(item, index) in shopbagData"
          :key="index"
        >
          <van-checkbox
            v-model="item.isCheck"
            checked-color="#0C34BA"
            icon-size="24px"
            class="fl"
            @change="simpleSelect"
          ></van-checkbox>
          <van-card
            :price="item.price*item.count"
            :desc="item.rule"
            :title="item.name"
            class="goods-card fl clearfix"
            :thumb="item.small_img"
            centered
          >
            <template #footer>
              <van-stepper
                v-model="item.count"
                theme="round"
                button-size="24"
                disable-input
                @change="modifyCount(item)"
              />
            </template>
          </van-card>
          <template #right>
            <van-button
              square
              text="删除"
              color="#0C34BA"
              type="danger"
              class="delete-button"
              @click="removeOneShopbag(item.sid)"
            />
          </template>
        </van-swipe-cell>
      </div>

      <van-submit-bar
        v-show="!isEdit"
        :price="total"
        button-text="提交订单"
        button-color="#0C34BA"
        @submit="commit"
      >
        <van-checkbox
          v-model="allCheck"
          @click="allSelect"
          checked-color="#0C34BA"
          icon-size="24px"
        >全选</van-checkbox>
      </van-submit-bar>

      <van-submit-bar
        v-show="isEdit"
        button-text="删除选择"
        button-color="#0C34BA"
        @submit="removeMoreShopbag"
      >
        <van-checkbox
          v-model="allCheck"
          @click="allSelect"
          icon-size="24px"
          checked-color="#0C34BA"
        >全选</van-checkbox>
      </van-submit-bar>
    </div>
    <div v-else>
      <van-empty description="购物袋空空如也,去逛一逛!">
        <van-button round color="#0C34BA" class="bottom-button" @click="goMenu">去逛一逛</van-button>
      </van-empty>
    </div>
    <div class="guess-box">
      <div class="guess-title">猜你喜欢</div>
      <div class="guess-change" @click="changshow">
        <van-icon name="replay" />换一换
      </div>
      <div class="product-box clearfix" >
        <transition-group name="van-slide-right">
          <div class="guess-item fl p-left" v-for="(item,index) in hotrList" :key="index">
            <div class="p-img">
              <van-image :src="item.smallImg">
                <template v-slot:loading>
                  <van-loading type="spinner" size="20" />
                </template>
              </van-image>
            </div>
            <div class="pro-text">
              <div class="pro-name one-text">{{item.name}}</div>
              <div class="pro-price">
                ￥{{item.price}}
                <van-icon name="add" size="20px" @click="viewProductInfo(item.pid)" />
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>
  </div>
</template>

<script>
import "../../assets/less/shopbag.less";
import { utils } from "../../assets/js/utils";
export default {
  name: "Shopbag",
  data() {
    return {
      isEdit: false,
      allCheck: false,
      shopbagData: [],
      total: 0,
      hotrList: [], // 猜你喜欢
      isshow: false,
    };
  },

  created() {
    //查询购物袋数据
    this.findShopbag();
    //查询推荐商品数据
    this.getShop();
  },

  methods: {
    //切换猜你喜欢的商品
    changshow() {
     this.getShop()
    },

    //查看商品详情
    viewProductInfo(pid) {
      this.$router.push({ name: "Detail", query: { pid } });
    },

    // 请求推荐商品数据
    getShop() {
      this.hotrList = []
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      this.axios({
        method: "GET",
        url: "/search",
        params: {
          appkey: this.appkey,
          name: "",
        },
      })
        .then((result) => {
          this.$toast.clear();
          let shopData = result.data.result;
          //  
          if (result.data.code == "Q001") {
            for (let i = 0; i < 3; i++) {
              let shop = Math.floor(Math.random() * (shopData.length));
              //  
              if(this.hotrList.indexOf(shopData[shop])==-1){
                this.hotrList.push(shopData[shop]);
              }else{
                i--
              }
            }
            //  
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //回到菜单
    goMenu() {
      this.$router.push({ name: "Menu" });
    },

    // 返回上一个跳转路径
    onClickLeft() {
      this.$router.go(-1);
      return;
    },

    // 编辑按钮
    editProduct() {
      this.isEdit = !this.isEdit;
    },

    //查询购物袋数据
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

          if (result.data.code == 5000) {
            result.data.result.map((v) => {
              v.isCheck = false;
            });

            this.shopbagData = result.data.result;
          } else {
            this.$toast(result.data.msg);
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //全选
    allSelect() {
      this.shopbagData.map((v) => {
        v.isCheck = this.allCheck;
      });

      this.sum();
    },

    //单选
    simpleSelect() {
      this.sum();

      for (let i = 0; i < this.shopbagData.length; i++) {
        if (!this.shopbagData[i].isCheck) {
          this.allCheck = false;
          return;
        }
      }

      this.allCheck = true;
    },

    //修改商品数量
    modifyCount(item) {
      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return;
      }

      //参数序列化
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        sid: item.sid,
        count: item.count,
      });

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      this.axios({
        method: "POST",
        url: "/modifyShopcartCount",
        data,
      })
        .then((result) => {
          this.$toast.clear();

          this.sum();
          if (result.data.code !== 6000) {
            this.$toast(result.data.msg);
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //删除购物袋数据
    removeShopbag(sids) {
      //sids: sid的集合，类型：array

      //获取token字符串
      let tokenString = localStorage.getItem("CSTK");
      if (!tokenString) {
        return;
      }

      //参数序列化
      let data = utils.queryString({
        appkey: this.appkey,
        tokenString,
        sids: JSON.stringify(sids),
      });

      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });

      return this.axios({
        method: "POST",
        url: "/deleteShopcart",
        data,
      });
    },

    //单个删除购物袋
    removeOneShopbag(sid, index) {
      this.removeShopbag([sid])
        .then((result) => {
          this.$toast.clear();

          if (result.data.code == 7000) {
            this.shopbagData.splice(index, 1);
          }

          this.$toast(result.data.msg);

          this.sum();
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //删除多个购物袋
    removeMoreShopbag() {
      //查找选择购物袋
      let sids = [];
      this.shopbagData.map((v) => {
        if (v.isCheck) {
          sids.push(v.sid);
        }
      });

      this.removeShopbag(sids)
        .then((result) => {
          this.$toast.clear();

          if (result.data.code == 7000) {
            for (let i = this.shopbagData.length - 1; i >= 0; i--) {
              if (this.shopbagData[i].isCheck) {
                this.shopbagData.splice(i, 1);
              }
            }

            this.sum();
          }

          this.$toast(result.data.msg);
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //计算总金额
    sum() {
      this.total = 0;
      this.shopbagData.map((v) => {
        if (v.isCheck) {
          this.total += v.count * v.price;
        }
      });

      this.total *= 100;
    },

    //提交订单
    commit() {
      //查找需要购买的商品, sid
      let sids = [];
      this.shopbagData.map((v) => {
        if (v.isCheck) {
          sids.push(v.sid);
        }
      });
    // 把数组中的所有元素放入一个字符串。
      sids = sids.join("-");

      this.$router.push({ name: "Pay", query: { sids } });

    },
  },
};
</script>

<style lang="less" scoped>
.bottom-button {
  width: 160px;
  height: 40px;
}
</style>