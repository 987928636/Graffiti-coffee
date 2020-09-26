<template>
  <div class="search">
    <van-nav-bar title="搜索页" left-text="返回" left-arrow :fixed="true" @click-left="back" />
    <div>
      <van-search
        v-model="searchValue"
        placeholder="请输入商品名称"
        shape="round"
        autofocus
        show-action
        @input="gosearch"
        maxlength="12"
      >
        <template #action>
          <div @click="onSearch">搜索</div>
        </template>
      </van-search>

      <ul class="search-text" v-if="!isShow">
        <li v-for="(item,index) in arrByZM" :key="index" @click="viewProductInfo(item.pid)">
          <span>
            <van-icon name="search" size="16px" />
          </span>
          {{item.name}}
        </li>
      </ul>

      <div class="menu-list" v-if="isShow">
        <van-skeleton :row="6" :loading="isLoading">
          <van-card
            centered
            v-for="(item,index) in searchData"
            tag="hot"
            :price="item.price"
            :desc="item.enname"
            :title="item.name"
            :key="index"
            lazy-load
          >
            <template #thumb>
              <img :src="item.smallImg" class="auto-img" alt @click="goProductInfo(item.pid)" />
            </template>
            <template #num>
              <van-button
                size="small"
                color="#0b34ba"
                icon="cart"
                round
                type="default"
                @click="viewProductInfo(item.pid)"
              >加入购物车</van-button>
            </template>
            <template #tags>
              <van-tag plain type="danger">{{item.typeDesc}}</van-tag>
            </template>
          </van-card>
        </van-skeleton>
      </div>

      <div class="search-box" v-if="searchValue==''">
        <div class="search-hot">
          <div class="search-hot-title">热门搜索</div>
          <div class="search-hot-box">
            <van-button
              type="default"
              v-for="(item,index) in hotrList"
              :key="index"
              @click="viewProductInfo(item.pid)"
            >{{item.name}}</van-button>
          </div>
        </div>
        <div class="search-history">
          <div class="search-history-title">
            历史搜索
            <span class="fr">
              <van-icon name="delete" size="20" @click="clearHistory" />
            </span>
          </div>
          <div class="search-history-box">
            <van-button
              type="default"
              v-for="(item,index) in history"
              :key="index"
              @click="viewProductInfo(item.pid)"
            >{{item.name}}</van-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import "../assets/less/search.less";
export default {
  naem: "Search",
  data() {
    return {
      searchValue: "", // 搜索字符串
      hotrList: [], // 热门推荐
      name: "", // 搜索商品关键字
      arrByZM: [], // 搜索数组
      history: [], // 历史搜索数组

      isLoading: true, //是否显示骨架屏
      searchData: [], //点击搜索按钮显示出来的商品列表信息
      isShow: false, // 是否显示商品列表信息
    };
  },

  created() {
    this.getHot();
    this.historyInit();
  },

  methods: {
    //查看历史搜索数组是否存在缓存
    historyInit() {
      let data = sessionStorage.getItem(history);
      if (data) {
        this.history = JSON.parse(data);

        return;
      }
    },

    //点击搜索按钮
    onSearch() {
      this.isShow = true;
      if (this.searchValue == "") {
        return;
      }
      this.searchData = []; //重置商品列表信息
      this.isLoading = true; //
      this.gosearch(); //调用搜索商品方法
      this.searchData = this.arrByZM; //将匹配到的商品数据赋值给商品列表信息数组
    },

    // 请求推荐商品数据
    getHot() {
      this.$toast.loading({
        message: "加载中...",
        forbidClick: true,
        duration: 0,
        loadingType: "spinner",
      });
      this.axios({
        method: "GET",
        url: "/typeProducts",
        params: {
          appkey: this.appkey,
          key: "isHot",
          value: 1,
        },
      })
        .then((result) => {
          this.$toast.clear();
          //
          if (result.data.code == 500) {
            this.hotrList = result.data.result;
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //搜索商品
    gosearch() {
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
        url: "/search",
        params: {
          appkey: this.appkey,
          name,
        },
      })
        .then((result) => {
          this.$toast.clear();
          this.arrByZM = []; //重置搜索到的商品数据
          this.isLoading = false;
          if (this.searchValue == "") {
            this.isShow = false; //如果搜索值为空，隐藏商品列表信息
            return;
          }

          for (let i = 0; i < result.data.result.length; i++) {
            //for循环数据中的每一项（根据name值）
            if (result.data.result[i].name.search(this.searchValue) != -1) {
              //判断输入框中的值是否可以匹配到数据，如果匹配成功
              this.arrByZM.push(result.data.result[i]);
              //向空数组中添加数据
            }
          }
        })
        .catch((err) => {
          this.$toast.clear();
        });
    },

    //查看商品详情
    viewProductInfo(pid) {
      //遍历搜索列表
      this.arrByZM.map((v) => {
        //将匹配到的商品数据追加到历史搜索数组中
        if (v.pid == pid) {
          this.history.push(v);
          //将商品数据缓存
          sessionStorage.setItem(history, JSON.stringify(this.history));
        }
      });
      this.$router.push({ name: "Detail", query: { pid } });
    },

    //清空历史搜索
    clearHistory() {
      if (this.history.length < 1) {
        this.$toast.fail("已经为空");
        return;
      }
      this.$dialog
        .confirm({
          message: "清空历史记录？",
        })
        .then(() => {
          //删除缓存的历史搜索纪录
          sessionStorage.removeItem(history);
          this.history = [];
        })
        .catch(() => {});
    },

    //返回上一链接
    back() {
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="less" scoped>
</style>