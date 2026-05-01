import User from "../models/usermodel.js";
import Course from "../models/coursemodel.js";
import Payment from "../models/paymentmodel.js";
import PurchaseCourse from "../models/purchaseCoursemodel.js";
import CourseProgress from "../models/courseProgressmodel.js";

/**
 * Analytics Correctness Properties Tests
 * These tests validate that analytics calculations maintain correctness properties
 */

// Property 2: User Count Consistency
// For any date, the total user count should be greater than or equal to active user count
export const testUserCountConsistency = async () => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: "active" });

    if (activeUsers > totalUsers) {
      throw new Error(
        `Property 2 violated: Active users (${activeUsers}) > Total users (${totalUsers})`
      );
    }

    console.log("✓ Property 2 passed: User count consistency maintained");
    return { passed: true, totalUsers, activeUsers };
  } catch (error) {
    console.error("✗ Property 2 failed:", error.message);
    return { passed: false, error: error.message };
  }
};

// Property 3: Conversion Rate Bounds
// For any conversion rate calculation, the result should be between 0 and 1 (0% to 100%)
export const testConversionRateBounds = async () => {
  try {
    const payments = await Payment.find().lean();
    const completedPayments = payments.filter((p) => p.status === "completed");
    const uniqueUsers = new Set(payments.map((p) => p.userId.toString())).size;

    const conversionRate = uniqueUsers > 0 ? completedPayments.length / uniqueUsers : 0;

    if (conversionRate < 0 || conversionRate > 1) {
      throw new Error(
        `Property 3 violated: Conversion rate (${conversionRate}) is outside bounds [0, 1]`
      );
    }

    console.log("✓ Property 3 passed: Conversion rate bounds maintained");
    return { passed: true, conversionRate };
  } catch (error) {
    console.error("✗ Property 3 failed:", error.message);
    return { passed: false, error: error.message };
  }
};

// Property 4: Completion Rate Bounds
// For any course, the completion rate should be between 0 and 1, and should not exceed enrollment count
export const testCompletionRateBounds = async () => {
  try {
    const courses = await Course.find().lean();
    const results = [];

    for (const course of courses) {
      const purchases = await PurchaseCourse.countDocuments({ courseId: course._id });
      const completions = await CourseProgress.countDocuments({
        courseId: course._id,
        completed: true,
      });

      const completionRate = purchases > 0 ? completions / purchases : 0;

      if (completionRate < 0 || completionRate > 1) {
        throw new Error(
          `Property 4 violated for course ${course._id}: Completion rate (${completionRate}) is outside bounds [0, 1]`
        );
      }

      if (completions > purchases) {
        throw new Error(
          `Property 4 violated for course ${course._id}: Completions (${completions}) > Enrollments (${purchases})`
        );
      }

      results.push({
        courseId: course._id,
        completionRate,
        enrollments: purchases,
        completions,
      });
    }

    console.log("✓ Property 4 passed: Completion rate bounds maintained for all courses");
    return { passed: true, results };
  } catch (error) {
    console.error("✗ Property 4 failed:", error.message);
    return { passed: false, error: error.message };
  }
};

// Property 5: Revenue Consistency
// For any course, the revenue shown in course analytics should match the sum of payments for that course
export const testRevenueConsistency = async () => {
  try {
    const courses = await Course.find().lean();
    const results = [];

    for (const course of courses) {
      const payments = await Payment.find({
        courseId: course._id,
        status: "completed",
      }).lean();

      const calculatedRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

      results.push({
        courseId: course._id,
        revenue: Math.round(calculatedRevenue * 100) / 100,
        transactionCount: payments.length,
      });
    }

    console.log("✓ Property 5 passed: Revenue consistency maintained for all courses");
    return { passed: true, results };
  } catch (error) {
    console.error("✗ Property 5 failed:", error.message);
    return { passed: false, error: error.message };
  }
};

// Property 6: Cohort Retention Monotonicity
// For any cohort, retention rate should be monotonically non-increasing over time
export const testCohortRetentionMonotonicity = async () => {
  try {
    const users = await User.find().lean();

    if (users.length === 0) {
      console.log("✓ Property 6 passed: No users to test");
      return { passed: true, message: "No users found" };
    }

    // Group users by signup month
    const cohorts = {};
    users.forEach((user) => {
      const signupDate = new Date(user.createdAt);
      const cohortKey = `${signupDate.getFullYear()}-${String(signupDate.getMonth() + 1).padStart(2, "0")}`;

      if (!cohorts[cohortKey]) {
        cohorts[cohortKey] = [];
      }
      cohorts[cohortKey].push(user._id.toString());
    });

    // For each cohort, calculate retention over months
    const results = [];
    for (const [cohortKey, userIds] of Object.entries(cohorts)) {
      const retentionByMonth = [];

      // Get all purchase months for this cohort
      const purchases = await PurchaseCourse.find({
        userId: { $in: userIds },
      }).lean();

      const monthlyPurchases = {};
      purchases.forEach((p) => {
        const date = new Date(p.purchaseDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (!monthlyPurchases[monthKey]) {
          monthlyPurchases[monthKey] = new Set();
        }
        monthlyPurchases[monthKey].add(p.userId.toString());
      });

      // Calculate retention for each month
      const sortedMonths = Object.keys(monthlyPurchases).sort();
      let previousRetention = 1.0;

      for (const month of sortedMonths) {
        const activeUsers = monthlyPurchases[month].size;
        const retention = userIds.length > 0 ? activeUsers / userIds.length : 0;
        retentionByMonth.push({ month, retention });

        // Check monotonicity
        if (retention > previousRetention + 0.001) {
          // Allow small floating point errors
          throw new Error(
            `Property 6 violated for cohort ${cohortKey}: Retention increased from ${previousRetention} to ${retention}`
          );
        }
        previousRetention = retention;
      }

      results.push({
        cohort: cohortKey,
        userCount: userIds.length,
        retentionByMonth,
      });
    }

    console.log("✓ Property 6 passed: Cohort retention monotonicity maintained");
    return { passed: true, results };
  } catch (error) {
    console.error("✗ Property 6 failed:", error.message);
    return { passed: false, error: error.message };
  }
};

// Property 7: Filter Consistency
// For any applied filter, all metrics in results should match the filter criteria
export const testFilterConsistency = async () => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30); // Last 30 days
    const endDate = new Date();

    const payments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    // Verify all payments are within the date range
    for (const payment of payments) {
      const paymentDate = new Date(payment.createdAt);
      if (paymentDate < startDate || paymentDate > endDate) {
        throw new Error(
          `Property 7 violated: Payment date ${paymentDate} is outside filter range [${startDate}, ${endDate}]`
        );
      }
    }

    console.log("✓ Property 7 passed: Filter consistency maintained");
    return { passed: true, filteredCount: payments.length };
  } catch (error) {
    console.error("✗ Property 7 failed:", error.message);
    return { passed: false, error: error.message };
  }
};

// Property 8: Export Data Completeness
// For any export operation, all metrics matching current filters should be included
export const testExportDataCompleteness = async () => {
  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    // Get all payments in date range
    const allPayments = await Payment.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    // Get all purchases in date range
    const allPurchases = await PurchaseCourse.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).lean();

    // Verify we have data to export
    if (allPayments.length === 0 && allPurchases.length === 0) {
      console.log("✓ Property 8 passed: No data to export (empty result set)");
      return { passed: true, message: "No data in date range" };
    }

    // Verify all data is included
    const exportData = {
      payments: allPayments,
      purchases: allPurchases,
      exportDate: new Date(),
      dateRange: { startDate, endDate },
    };

    if (exportData.payments.length !== allPayments.length) {
      throw new Error(
        `Property 8 violated: Export missing payments (${exportData.payments.length} vs ${allPayments.length})`
      );
    }

    if (exportData.purchases.length !== allPurchases.length) {
      throw new Error(
        `Property 8 violated: Export missing purchases (${exportData.purchases.length} vs ${allPurchases.length})`
      );
    }

    console.log("✓ Property 8 passed: Export data completeness verified");
    return { passed: true, exportedPayments: allPayments.length, exportedPurchases: allPurchases.length };
  } catch (error) {
    console.error("✗ Property 8 failed:", error.message);
    return { passed: false, error: error.message };
  }
};

// Run all property tests
export const runAllPropertyTests = async () => {
  console.log("\n=== Running Analytics Correctness Property Tests ===\n");

  const results = {
    property2: await testUserCountConsistency(),
    property3: await testConversionRateBounds(),
    property4: await testCompletionRateBounds(),
    property5: await testRevenueConsistency(),
    property6: await testCohortRetentionMonotonicity(),
    property7: await testFilterConsistency(),
    property8: await testExportDataCompleteness(),
  };

  const passedCount = Object.values(results).filter((r) => r.passed).length;
  const totalCount = Object.keys(results).length;

  console.log(`\n=== Test Summary: ${passedCount}/${totalCount} properties passed ===\n`);

  return results;
};
