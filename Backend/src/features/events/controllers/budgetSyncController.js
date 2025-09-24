import Event from "../../../shared/models/eventModel.js";
import NoteOrder from "../../../shared/models/noteOrderModel.js";
import asyncHandler from "express-async-handler";

// Sync budget breakdown with claim bill - ensure all expenses are included
export const syncBudgetWithClaimBill = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Find the event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get note order expenses (initial budget)
    const budgetExpenses = event.noteOrder?.expenses || [];

    // Get current claim bill expenses
    const claimExpenses = event.claimBill?.expenses || [];

    if (budgetExpenses.length === 0) {
      return res.status(400).json({ 
        message: "No budget breakdown expenses found to sync" 
      });
    }

    // Create comprehensive claim bill expenses from budget breakdown
    const syncedExpenses = budgetExpenses.map((budgetExp, index) => {
      // Check if this expense already exists in claim bill
      const existingClaimExp = claimExpenses.find(claimExp => 
        claimExp.category === budgetExp.category
      );

      if (existingClaimExp) {
        // Keep existing claim data but ensure all fields are present
        return {
          ...existingClaimExp,
          budgetAmount: budgetExp.amount || existingClaimExp.budgetAmount || 0,
          actualAmount: existingClaimExp.actualAmount || budgetExp.amount || 0,
          amount: existingClaimExp.amount || budgetExp.amount || 0,
          category: budgetExp.category,
          description: existingClaimExp.description || `Expense for ${budgetExp.category}`,
          itemStatus: existingClaimExp.itemStatus || "pending",
          approvedAmount: existingClaimExp.approvedAmount || 0,
          rejectionReason: existingClaimExp.rejectionReason || "",
          receiptNumber: existingClaimExp.receiptNumber || null,
          receiptGenerated: existingClaimExp.receiptGenerated || false,
          reviewDate: existingClaimExp.reviewDate || null,
          reviewedBy: existingClaimExp.reviewedBy || null
        };
      } else {
        // Create new claim expense from budget breakdown
        return {
          category: budgetExp.category,
          budgetAmount: budgetExp.amount || 0,
          actualAmount: budgetExp.amount || 0,
          amount: budgetExp.amount || 0,
          description: `Expense for ${budgetExp.category}`,
          itemStatus: "pending",
          approvedAmount: 0,
          rejectionReason: "",
          receiptNumber: null,
          receiptGenerated: false,
          reviewDate: null,
          reviewedBy: null
        };
      }
    });

    // Calculate totals
    const totalBudgetAmount = syncedExpenses.reduce(
      (sum, exp) => sum + (exp.budgetAmount || 0), 0
    );
    const totalActualAmount = syncedExpenses.reduce(
      (sum, exp) => sum + (exp.actualAmount || 0), 0
    );
    const totalApprovedAmount = syncedExpenses.reduce(
      (sum, exp) => sum + (exp.approvedAmount || 0), 0
    );

    // Update claim bill with synced data
    if (!event.claimBill) {
      event.claimBill = {};
    }

    event.claimBill.expenses = syncedExpenses;
    event.claimBill.totalBudgetAmount = totalBudgetAmount;
    event.claimBill.totalExpenditure = totalActualAmount;
    event.claimBill.totalApprovedAmount = totalApprovedAmount;
    event.claimBill.status = event.claimBill.status || "pending";
    event.claimBill.submissionDate = event.claimBill.submissionDate || new Date();
    event.claimBill.createdAt = event.claimBill.createdAt || new Date();

    // Mark as submitted if not already
    event.claimSubmitted = true;

    // Save the updated event
    event.markModified('claimBill');
    await event.save();

    res.json({
      message: "Budget breakdown synced with claim bill successfully",
      syncedExpenses: syncedExpenses.length,
      totals: {
        totalBudgetAmount,
        totalActualAmount,
        totalApprovedAmount
      },
      expenses: syncedExpenses
    });

  } catch (error) {
    console.error('❌ Error syncing budget with claim bill:', error);
    res.status(500).json({
      message: 'Error syncing budget with claim bill',
      error: error.message
    });
  }
});

// Get budget breakdown vs claim bill comparison
export const getBudgetClaimComparison = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const budgetExpenses = event.budgetBreakdown?.expenses || [];
    const claimExpenses = event.claimBill?.expenses || [];

    // Create comparison data
    const comparison = {
      eventTitle: event.title,
      budgetBreakdown: {
        expenses: budgetExpenses,
        totalExpenditure: event.budgetBreakdown?.totalExpenditure || 0,
        count: budgetExpenses.length
      },
      claimBill: {
        expenses: claimExpenses,
        totalBudgetAmount: event.claimBill?.totalBudgetAmount || 0,
        totalExpenditure: event.claimBill?.totalExpenditure || 0,
        totalApprovedAmount: event.claimBill?.totalApprovedAmount || 0,
        status: event.claimBill?.status || "not_submitted",
        count: claimExpenses.length
      },
      discrepancies: [],
      needsSync: false
    };

    // Check for discrepancies
    if (budgetExpenses.length !== claimExpenses.length) {
      comparison.needsSync = true;
      comparison.discrepancies.push({
        type: "count_mismatch",
        message: `Budget has ${budgetExpenses.length} expenses, claim has ${claimExpenses.length} expenses`
      });
    }

    // Check for missing expenses in claim bill
    budgetExpenses.forEach(budgetExp => {
      const claimExp = claimExpenses.find(c => c.category === budgetExp.category);
      if (!claimExp) {
        comparison.needsSync = true;
        comparison.discrepancies.push({
          type: "missing_in_claim",
          category: budgetExp.category,
          amount: budgetExp.amount,
          message: `Budget expense "${budgetExp.category}" not found in claim bill`
        });
      }
    });

    // Check for extra expenses in claim bill
    claimExpenses.forEach(claimExp => {
      const budgetExp = budgetExpenses.find(b => b.category === claimExp.category);
      if (!budgetExp) {
        comparison.discrepancies.push({
          type: "extra_in_claim",
          category: claimExp.category,
          amount: claimExp.actualAmount || claimExp.amount,
          message: `Claim expense "${claimExp.category}" not found in budget breakdown`
        });
      }
    });

    res.json(comparison);

  } catch (error) {
    console.error('❌ Error getting budget claim comparison:', error);
    res.status(500).json({
      message: 'Error getting budget claim comparison',
      error: error.message
    });
  }
});

// Fix specific event's budget and claim synchronization
export const fixEventBudgetSync = asyncHandler(async (req, res) => {
  try {
    const { eventId } = req.params;
    const { action } = req.body; // 'sync_from_budget' or 'sync_from_claim'
    
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    let result = {};

    if (action === 'sync_from_budget') {
      // Sync claim bill from budget breakdown
      const budgetExpenses = event.budgetBreakdown?.expenses || [];
      
      if (budgetExpenses.length === 0) {
        return res.status(400).json({ 
          message: "No budget breakdown expenses to sync from" 
        });
      }

      // Create or update claim bill from budget
      const claimExpenses = budgetExpenses.map(budgetExp => ({
        category: budgetExp.category,
        budgetAmount: budgetExp.amount || 0,
        actualAmount: budgetExp.amount || 0,
        amount: budgetExp.amount || 0,
        description: `Expense for ${budgetExp.category}`,
        itemStatus: "pending",
        approvedAmount: 0,
        rejectionReason: "",
        receiptNumber: null,
        receiptGenerated: false
      }));

      const totalAmount = claimExpenses.reduce((sum, exp) => sum + exp.actualAmount, 0);

      event.claimBill = {
        expenses: claimExpenses,
        totalBudgetAmount: totalAmount,
        totalExpenditure: totalAmount,
        totalApprovedAmount: 0,
        status: "pending",
        submissionDate: new Date(),
        createdAt: new Date()
      };

      event.claimSubmitted = true;
      result = { action: 'synced_from_budget', expenseCount: claimExpenses.length };

    } else if (action === 'sync_from_claim') {
      // Sync budget breakdown from claim bill
      const claimExpenses = event.claimBill?.expenses || [];
      
      if (claimExpenses.length === 0) {
        return res.status(400).json({ 
          message: "No claim bill expenses to sync from" 
        });
      }

      // Update budget breakdown from claim
      const budgetExpenses = claimExpenses.map(claimExp => ({
        category: claimExp.category,
        amount: claimExp.actualAmount || claimExp.amount || 0
      }));

      const totalExpenditure = budgetExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      if (!event.budgetBreakdown) {
        event.budgetBreakdown = {};
      }

      event.budgetBreakdown.expenses = budgetExpenses;
      event.budgetBreakdown.totalExpenditure = totalExpenditure;

      result = { action: 'synced_from_claim', expenseCount: budgetExpenses.length };
    } else {
      return res.status(400).json({ 
        message: "Invalid action. Use 'sync_from_budget' or 'sync_from_claim'" 
      });
    }

    // Save changes
    event.markModified('claimBill');
    event.markModified('budgetBreakdown');
    await event.save();

    res.json({
      message: "Event budget synchronization fixed successfully",
      ...result,
      eventId: event._id,
      eventTitle: event.title
    });

  } catch (error) {
    console.error('❌ Error fixing event budget sync:', error);
    res.status(500).json({
      message: 'Error fixing event budget sync',
      error: error.message
    });
  }
});

// Bulk sync all events that have discrepancies
export const bulkSyncAllEvents = asyncHandler(async (req, res) => {
  try {

    // Find all events that have budget breakdown but incomplete claim bills
    const events = await Event.find({
      'budgetBreakdown.expenses': { $exists: true, $ne: [] }
    });

    let syncedCount = 0;
    let errorCount = 0;
    const results = [];

    for (const event of events) {
      try {
        const budgetExpenses = event.budgetBreakdown?.expenses || [];
        const claimExpenses = event.claimBill?.expenses || [];

        // Check if sync is needed
        const needsSync = budgetExpenses.length !== claimExpenses.length ||
                         budgetExpenses.some(budgetExp => 
                           !claimExpenses.find(claimExp => claimExp.category === budgetExp.category)
                         );

        if (needsSync) {

          // Create synced expenses
          const syncedExpenses = budgetExpenses.map(budgetExp => {
            const existingClaimExp = claimExpenses.find(claimExp => 
              claimExp.category === budgetExp.category
            );

            if (existingClaimExp) {
              return {
                ...existingClaimExp,
                budgetAmount: budgetExp.amount || existingClaimExp.budgetAmount || 0,
                actualAmount: existingClaimExp.actualAmount || budgetExp.amount || 0,
                amount: existingClaimExp.amount || budgetExp.amount || 0
              };
            } else {
              return {
                category: budgetExp.category,
                budgetAmount: budgetExp.amount || 0,
                actualAmount: budgetExp.amount || 0,
                amount: budgetExp.amount || 0,
                description: `Expense for ${budgetExp.category}`,
                itemStatus: "pending",
                approvedAmount: 0,
                rejectionReason: "",
                receiptNumber: null,
                receiptGenerated: false
              };
            }
          });

          // Update claim bill
          const totalBudgetAmount = syncedExpenses.reduce(
            (sum, exp) => sum + (exp.budgetAmount || 0), 0
          );
          const totalActualAmount = syncedExpenses.reduce(
            (sum, exp) => sum + (exp.actualAmount || 0), 0
          );

          if (!event.claimBill) {
            event.claimBill = {};
          }

          event.claimBill.expenses = syncedExpenses;
          event.claimBill.totalBudgetAmount = totalBudgetAmount;
          event.claimBill.totalExpenditure = totalActualAmount;
          event.claimBill.status = event.claimBill.status || "pending";
          event.claimBill.submissionDate = event.claimBill.submissionDate || new Date();
          event.claimBill.createdAt = event.claimBill.createdAt || new Date();

          event.claimSubmitted = true;
          event.markModified('claimBill');
          await event.save();

          syncedCount++;
          results.push({
            eventId: event._id,
            title: event.title,
            status: 'synced',
            expenseCount: syncedExpenses.length
          });
        } else {
          results.push({
            eventId: event._id,
            title: event.title,
            status: 'already_synced',
            expenseCount: claimExpenses.length
          });
        }
      } catch (error) {
        console.error(`❌ Error syncing event ${event.title}:`, error);
        errorCount++;
        results.push({
          eventId: event._id,
          title: event.title,
          status: 'error',
          error: error.message
        });
      }
    }

    res.json({
      message: "Bulk sync completed",
      totalEvents: events.length,
      syncedCount,
      errorCount,
      results
    });

  } catch (error) {
    console.error('❌ Error in bulk sync:', error);
    res.status(500).json({
      message: 'Error in bulk sync operation',
      error: error.message
    });
  }
});

// Migrate events that still have embedded noteOrder objects to NoteOrder collection
export const migrateEmbeddedNoteOrder = asyncHandler(async (req, res) => {
  const events = await Event.find({ noteOrder: { $exists: true, $type: 'object' } });
  let migrated = 0;
  for (const ev of events) {
    try {
      const embedded = ev.noteOrder || {};
      const note = new NoteOrder({
        eventId: ev._id,
        income: embedded.income || [],
        expenses: embedded.expenses || [],
        totalIncome: embedded.totalIncome || 0,
        totalExpenditure: embedded.totalExpenditure || 0,
        universityOverhead: embedded.universityOverhead || 0,
      });
      const saved = await note.save();
      ev.noteOrder = saved._id;
      await ev.save();
      migrated++;
    } catch (e) {
      console.error('Migration failed for event', ev._id, e.message);
    }
  }
  res.json({ success: true, migrated });
});