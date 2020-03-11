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
      console.log(123);
      this.triggerEvent("myevent", [1, 2, 3, 4, 5]);
      this.setData({
        PageCur: e.currentTarget.dataset.cur
      });
    }
  }
});
