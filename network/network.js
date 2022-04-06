const { default: axios } = require("axios");
const { token } = require("../consts/constants");

module.exports = new (class {
  constructor() {
    this.axiosConfig = axios.create({
      baseURL: "https://marketing.tllms.com/web/v1",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }
  async getPostHistory(perPage = 10, pageNo = 1) {
    return (
      await this.axiosConfig.get("doubt_management/posts", {
        params: {
          q: "answered",
          sort: "updated_at",
          direction: "desc",
          per_page: perPage,
          page: pageNo,
        },
      })
    ).data;
  }
})();
