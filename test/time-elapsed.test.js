"use strict";

const test = require("node:test");
const assert = require("node:assert");

const { calculateElapsed, formatElapsed } = require("../time-elapsed.js");

// Dates are built with the local-time constructor throughout, so these tests
// hold in any time zone.
function at(year, month, day, hour, minute, second) {
  return new Date(year, month - 1, day, hour || 0, minute || 0, second || 0);
}

function elapsedBetween(from, to) {
  return calculateElapsed(from, to);
}

function assertElapsed(actual, expected) {
  assert.deepStrictEqual(actual, {
    years: expected.years || 0,
    months: expected.months || 0,
    days: expected.days || 0,
    hours: expected.hours || 0,
    minutes: expected.minutes || 0,
    seconds: expected.seconds || 0,
  });
}

// The date the page counts from: 2pm, 7 February 2019.
const PAGE_TARGET = at(2019, 2, 7, 14, 0, 0);

test("anniversaries land exactly on a whole unit", async (t) => {
  await t.test("one year later is one year, nothing else", () => {
    assertElapsed(elapsedBetween(PAGE_TARGET, at(2020, 2, 7, 14)), {
      years: 1,
    });
  });

  await t.test("a leap year does not add stray days", () => {
    // 2020 is a leap year, so this span is 366 days long.
    assertElapsed(elapsedBetween(PAGE_TARGET, at(2021, 2, 7, 14)), {
      years: 2,
    });
  });

  await t.test("one month later is one month, nothing else", () => {
    assertElapsed(elapsedBetween(PAGE_TARGET, at(2019, 3, 7, 14)), {
      months: 1,
    });
  });

  await t.test("one day later is one day, nothing else", () => {
    assertElapsed(elapsedBetween(PAGE_TARGET, at(2019, 2, 8, 14)), {
      days: 1,
    });
  });

  await t.test("identical dates are all zeros", () => {
    assertElapsed(elapsedBetween(PAGE_TARGET, PAGE_TARGET), {});
  });
});

test("months are counted on the calendar, not as 30-day blocks", async (t) => {
  await t.test("a 28-day February counts as one whole month", () => {
    assertElapsed(elapsedBetween(at(2019, 2, 1), at(2019, 3, 1)), {
      months: 1,
    });
  });

  await t.test("a 31-day March counts as one whole month", () => {
    assertElapsed(elapsedBetween(at(2019, 3, 1), at(2019, 4, 1)), {
      months: 1,
    });
  });

  await t.test("a 29-day leap February counts as one whole month", () => {
    assertElapsed(elapsedBetween(at(2020, 2, 1), at(2020, 3, 1)), {
      months: 1,
    });
  });

  await t.test("twelve months roll up into a year", () => {
    assertElapsed(elapsedBetween(at(2019, 1, 15), at(2020, 1, 15)), {
      years: 1,
    });
  });

  await t.test("months never reach twelve", () => {
    assertElapsed(elapsedBetween(at(2019, 1, 15), at(2019, 12, 15)), {
      months: 11,
    });
  });
});

test("partial months keep the leftover days", async (t) => {
  await t.test("stops one day short of the month", () => {
    // February 2019 has 28 days.
    assertElapsed(elapsedBetween(at(2019, 2, 7), at(2019, 3, 6)), {
      days: 27,
    });
  });

  await t.test("one day past the month", () => {
    assertElapsed(elapsedBetween(at(2019, 2, 7), at(2019, 3, 8)), {
      months: 1,
      days: 1,
    });
  });

  await t.test("years, months and days together", () => {
    assertElapsed(elapsedBetween(PAGE_TARGET, at(2026, 8, 14, 12)), {
      years: 7,
      months: 6,
      days: 6,
      hours: 22,
    });
  });
});

test("month-end dates clamp instead of overflowing", async (t) => {
  await t.test("31 January to 28 February is one whole month", () => {
    assertElapsed(elapsedBetween(at(2019, 1, 31), at(2019, 2, 28)), {
      months: 1,
    });
  });

  await t.test("31 January to 1 March keeps the extra day", () => {
    assertElapsed(elapsedBetween(at(2019, 1, 31), at(2019, 3, 1)), {
      months: 1,
      days: 1,
    });
  });

  await t.test("29 February to 28 February is one whole year", () => {
    assertElapsed(elapsedBetween(at(2020, 2, 29), at(2021, 2, 28)), {
      years: 1,
    });
  });
});

test("the clock remainder", async (t) => {
  await t.test("hours, minutes and seconds", () => {
    assertElapsed(elapsedBetween(at(2019, 2, 7, 14), at(2019, 2, 7, 17, 34, 5)), {
      hours: 3,
      minutes: 34,
      seconds: 5,
    });
  });

  await t.test("one second short of a day borrows correctly", () => {
    assertElapsed(elapsedBetween(at(2019, 2, 7, 14), at(2019, 2, 8, 13, 59, 59)), {
      hours: 23,
      minutes: 59,
      seconds: 59,
    });
  });

  await t.test("one second short of a month borrows correctly", () => {
    assertElapsed(elapsedBetween(at(2019, 2, 7, 14), at(2019, 3, 7, 13, 59, 59)), {
      days: 27,
      hours: 23,
      minutes: 59,
      seconds: 59,
    });
  });

  await t.test("the time of day is not yet reached", () => {
    assertElapsed(elapsedBetween(at(2019, 2, 7, 14), at(2020, 2, 7, 9)), {
      months: 11,
      days: 30,
      hours: 19,
    });
  });

  await t.test("sub-second differences are dropped, not rounded up", () => {
    const from = at(2019, 2, 7, 14, 0, 0);
    const to = new Date(from.getTime() + 999);
    assertElapsed(elapsedBetween(from, to), {});
  });
});

test("daylight saving days stay whole days", () => {
  // Only meaningful in a zone that actually shifts; skipped elsewhere.
  const before = at(2024, 3, 25, 12);
  const after = at(2024, 4, 1, 12);
  if (before.getTimezoneOffset() === after.getTimezoneOffset()) {
    return;
  }

  assertElapsed(elapsedBetween(before, after), { days: 7 });
});

test("dates that have not arrived yet read as zero", async (t) => {
  await t.test("a target date in the future", () => {
    assertElapsed(elapsedBetween(at(2030, 1, 1), at(2026, 1, 1)), {});
  });

  await t.test("one second before the target date", () => {
    const to = new Date(PAGE_TARGET.getTime() - 1000);
    assertElapsed(elapsedBetween(PAGE_TARGET, to), {});
  });
});

test("invalid arguments are rejected", async (t) => {
  await t.test("non-dates throw", () => {
    assert.throws(() => calculateElapsed("2019-02-07", new Date()), TypeError);
    assert.throws(() => calculateElapsed(new Date(), 1549548000000), TypeError);
    assert.throws(() => calculateElapsed(new Date()), TypeError);
  });

  await t.test("invalid dates throw", () => {
    assert.throws(
      () => calculateElapsed(new Date("nonsense"), new Date()),
      RangeError
    );
    assert.throws(
      () => calculateElapsed(new Date(), new Date("nonsense")),
      RangeError
    );
  });
});

test("formatting", async (t) => {
  await t.test("pluralises every unit", () => {
    assert.strictEqual(
      formatElapsed({
        years: 7,
        months: 6,
        days: 6,
        hours: 22,
        minutes: 30,
        seconds: 15,
      }),
      "7 years, 6 months, 6 days, 22 hours, 30 minutes, 15 seconds"
    );
  });

  await t.test("uses the singular for exactly one", () => {
    assert.strictEqual(
      formatElapsed({
        years: 1,
        months: 1,
        days: 1,
        hours: 1,
        minutes: 1,
        seconds: 1,
      }),
      "1 year, 1 month, 1 day, 1 hour, 1 minute, 1 second"
    );
  });

  await t.test("keeps zeroed units so the line does not jump about", () => {
    assert.strictEqual(
      formatElapsed({
        years: 0,
        months: 0,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      }),
      "0 years, 0 months, 0 days, 0 hours, 0 minutes, 0 seconds"
    );
  });
});

test("every field stays inside its own range", () => {
  // A deterministic sweep: each unit must carry into the next rather than
  // spilling over, for any pair of dates.
  let seed = 20190207;
  const random = () => {
    seed = (seed * 1103515245 + 12345) % 2147483648;
    return seed / 2147483648;
  };

  for (let i = 0; i < 2000; i++) {
    const to = new Date(
      PAGE_TARGET.getTime() + Math.floor(random() * 15 * 365 * 86400000)
    );
    const elapsed = elapsedBetween(PAGE_TARGET, to);
    const label = PAGE_TARGET.toISOString() + " -> " + to.toISOString();

    for (const unit of Object.keys(elapsed)) {
      assert.ok(
        Number.isInteger(elapsed[unit]) && elapsed[unit] >= 0,
        unit + " should be a non-negative integer for " + label
      );
    }
    assert.ok(elapsed.months < 12, "months should carry into years: " + label);
    assert.ok(elapsed.days < 31, "days should carry into months: " + label);
    assert.ok(elapsed.hours < 24, "hours should carry into days: " + label);
    assert.ok(elapsed.minutes < 60, "minutes should carry into hours: " + label);
    assert.ok(elapsed.seconds < 60, "seconds should carry into minutes: " + label);
  }
});
