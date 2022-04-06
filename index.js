const {
  calculateTotalPoints,
} = require("./tasks/calculate_total_points_per_month");

(async () => {
  await calculateTotalPoints();
})();
