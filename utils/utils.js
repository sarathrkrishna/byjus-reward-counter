exports.getTimestamp = ({
  dayOfMonth,
  month, // in words
  year,
}) => new Date(`${dayOfMonth} ${month} ${year}`).getTime();

exports.delayMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

exports.epocToTimestamp = (epochStamp) => Number(epochStamp + "000");
