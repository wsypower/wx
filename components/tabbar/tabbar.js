const app = getApp();
Component({
  options: {
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {},

  /**
   * 组件的初始数据
   */
  data: {
    PageCur: "basics",
    Pages: ["home", "features", "my"]
  },
  /**
   * 组件的方法列表
   */
  methods: {
    NavChange(e) {
      this.setData({
        PageCur: e.currentTarget.dataset.cur
      });
    }
  }
});
