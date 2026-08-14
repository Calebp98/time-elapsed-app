// Calendar-aware elapsed time.
//
// Loaded as a plain script in the browser (exposes `TimeElapsed` on the global)
// and as a CommonJS module by the tests.
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && typeof module.exports === "object") {
    module.exports = api;
  } else {
    root.TimeElapsed = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MS_PER_SECOND = 1000;
  const MS_PER_MINUTE = 60 * MS_PER_SECOND;
  const MS_PER_HOUR = 60 * MS_PER_MINUTE;
  const MS_PER_DAY = 24 * MS_PER_HOUR;

  // Adds whole calendar months, clamping the day when the target month is
  // shorter: 31 January + 1 month is 28 February, not 3 March.
  function addMonths(date, months) {
    const year = date.getFullYear();
    const month = date.getMonth() + months;
    const daysInTargetMonth = new Date(year, month + 1, 0).getDate();
    return new Date(
      year,
      month,
      Math.min(date.getDate(), daysInTargetMonth),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
      date.getMilliseconds()
    );
  }

  function addDays(date, days) {
    const result = new Date(date.getTime());
    result.setDate(result.getDate() + days);
    return result;
  }

  // Breaks the span between two dates into calendar years, months and days
  // plus a clock remainder. Months and days are counted against the calendar
  // rather than fixed averages, so a whole month always reads as a whole month
  // whether it is 28 days or 31, and a day stays a day across daylight saving.
  function calculateElapsed(from, to) {
    if (!(from instanceof Date) || !(to instanceof Date)) {
      throw new TypeError("calculateElapsed expects two Date objects");
    }
    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new RangeError("calculateElapsed expects two valid Dates");
    }

    // Nothing has elapsed yet if the target date is still in the future.
    if (to <= from) {
      return { years: 0, months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
    }

    // Whole calendar months, walked back by one if the day of the month has
    // not come round yet (7 Jan -> 6 Feb is 0 months, not 1).
    let months =
      (to.getFullYear() - from.getFullYear()) * 12 +
      (to.getMonth() - from.getMonth());
    while (months > 0 && addMonths(from, months) > to) {
      months--;
    }
    const monthAnchor = addMonths(from, months);

    // Whole days on top of those months. Counting on the calendar rather than
    // dividing milliseconds keeps 23- and 25-hour daylight saving days whole.
    let days = Math.floor((to - monthAnchor) / MS_PER_DAY);
    while (addDays(monthAnchor, days + 1) <= to) {
      days++;
    }
    while (days > 0 && addDays(monthAnchor, days) > to) {
      days--;
    }

    let remainder = to - addDays(monthAnchor, days);
    const hours = Math.floor(remainder / MS_PER_HOUR);
    remainder -= hours * MS_PER_HOUR;
    const minutes = Math.floor(remainder / MS_PER_MINUTE);
    remainder -= minutes * MS_PER_MINUTE;
    const seconds = Math.floor(remainder / MS_PER_SECOND);

    return {
      years: Math.floor(months / 12),
      months: months % 12,
      days: days,
      hours: hours,
      minutes: minutes,
      seconds: seconds,
    };
  }

  function pluralize(value, unit) {
    return value + " " + unit + (value === 1 ? "" : "s");
  }

  function formatElapsed(elapsed) {
    return [
      pluralize(elapsed.years, "year"),
      pluralize(elapsed.months, "month"),
      pluralize(elapsed.days, "day"),
      pluralize(elapsed.hours, "hour"),
      pluralize(elapsed.minutes, "minute"),
      pluralize(elapsed.seconds, "second"),
    ].join(", ");
  }

  return {
    calculateElapsed: calculateElapsed,
    formatElapsed: formatElapsed,
  };
});
