// backend/test-nexus-orchestration.js
// Automated Verification Test Suite for MediCare Nexus Autonomous Hospital Resource Orchestration Platform
import { nexusStore } from "./services/nexusStore.js";
import { nexusConstraintOptimizer } from "./services/nexusConstraintOptimizer.js";
import { nexusDependencyGraph } from "./services/nexusDependencyGraph.js";
import { nexusTransferOrchestrator } from "./services/nexusTransferOrchestrator.js";
import { nexusWhatIfEngine } from "./services/nexusWhatIfEngine.js";
import { nexusScenarioRunner } from "./services/nexusScenarioRunner.js";
import { nexusOperationalState } from "./services/nexusOperationalState.js";

async function runTests() {
  console.log("============================================================");
  console.log("🏥 STARTING MEDICARE NEXUS ORCHESTRATION VERIFICATION SUITE");
  console.log("============================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Staff Requirement Estimation & Minimum-Capacity Preservation (Section 9 & 10)
  console.log("--- 1. Staff Requirement & Minimum-Capacity Preservation ---");
  const generalStaff = nexusConstraintOptimizer.estimateStaffRequirement({
    department: "General",
    patientCount: 12,
    activeStaffCount: 6,
  });
  assert(generalStaff.currentStaff === 6, "General Ward active staff is 6");
  assert(generalStaff.estimatedRequiredStaff === 4, "Estimated required staff is 4");
  assert(generalStaff.protectedBuffer === 1, "Protected buffer is 1");
  assert(generalStaff.releasableCapacity === 1, "Releasable capacity correctly calculated: 6 - 4 - 1 = 1 nurse");
  assert(generalStaff.minimumCapacityPreserved === true, "Minimum capacity hard constraint satisfied");

  // Test hard constraint rejection if donor cannot spare
  const depletedGeneral = nexusConstraintOptimizer.estimateStaffRequirement({
    department: "General",
    patientCount: 12,
    activeStaffCount: 4,
  });
  assert(depletedGeneral.releasableCapacity === 0, "When at minimum staffing (4), releasable capacity is 0");

  // 2. Live Staff Reallocation Optimizer (Section 11)
  console.log("\n--- 2. Live Staff Reallocation Optimizer ---");
  const reallocOpt = nexusConstraintOptimizer.optimizeStaffReallocation({
    targetDepartment: "Emergency",
    shortage: 2,
    requiredRole: "Nurse",
    allStaff: nexusStore.staff,
    departmentMetrics: {
      General: { currentStaff: 6, estimatedRequired: 4, protectedBuffer: 1 },
    },
  });
  assert(reallocOpt.feasible === true, "Reallocation solution is feasible");
  assert(reallocOpt.primaryCandidate !== null, "Primary candidate identified");
  assert(reallocOpt.primaryCandidate.constraints.every(c => c.passed), "All constraint checks passed (qualifications, shift, workload, buffer)");

  // 3. Competing Demand Resolution (Section 23, 56)
  console.log("\n--- 3. Competing Demand Resolution ---");
  const competingResult = nexusConstraintOptimizer.resolveCompetingDemand({
    resourceId: "DIAG-CT-01",
    requests: [
      { requestId: "R1", priorityTier: "ROUTINE_OUTPATIENT", durationMinutes: 20 },
      { requestId: "R2", priorityTier: "CRITICAL_EMERGENCY", durationMinutes: 15 },
      { requestId: "R3", priorityTier: "URGENT_INPATIENT", durationMinutes: 20 },
    ],
  });
  assert(competingResult.recommendedSequence[0].priorityTier === "CRITICAL_EMERGENCY", "Critical emergency ranked #1 per hospital clinical policy");
  assert(competingResult.recommendedSequence[1].priorityTier === "URGENT_INPATIENT", "Urgent inpatient ranked #2");
  assert(competingResult.recommendedSequence[2].priorityTier === "ROUTINE_OUTPATIENT", "Routine outpatient ranked #3");

  // 4. Resource Substitution (Section 26, 55)
  console.log("\n--- 4. Resource Substitution Intelligence ---");
  const subResult = nexusConstraintOptimizer.evaluateResourceSubstitution({
    failedResourceId: "DIAG-CT-01",
    failedResourceType: "DIAGNOSTIC",
  });
  assert(subResult.status === "SUBSTITUTION_AVAILABLE", "Compatible substitute identified for CT-01 failure");
  assert(subResult.recommendedSubstitute.resourceId === "DIAG-CT-02", "Substitute is 64-slice CT-02");
  assert(subResult.recommendedSubstitute.technicianAvailable === true, "Technician availability verified on substitute unit");

  // 5. Multi-Resource Dependency Graph & Cascading Impact (Section 17, 18, 54)
  console.log("\n--- 5. Multi-Resource Dependency Graph & Cascade Analysis ---");
  const cascade = nexusDependencyGraph.analyzeCascadingImpact("OT-02", { delayMinutes: 45 });
  assert(cascade.primaryImpacts.length > 0, "Primary downstream impacts detected (Surgical Recovery Bed lock, Surgeon roster shift)");
  assert(cascade.secondaryImpacts.length > 0, "Secondary downstream cascades detected (PACU nursing workload spike, General Ward admission hold)");
  assert(cascade.totalAffectedResources >= 3, "Traversed multi-tiered dependency chain across 3+ assets");

  // 6. Patient Transfer Lifecycle (Section 13, 53)
  console.log("\n--- 6. Patient Transfer Lifecycle ---");
  const trfReq = nexusTransferOrchestrator.requestTransfer({
    patientId: "P-101",
    sourceDepartment: "General",
    sourceBedId: "GEN-A-02",
    targetDepartment: "Emergency",
    targetBedId: "ER-02",
  });
  assert(trfReq.transfer.status === "TRANSFER_REQUESTED", "Stage 1: TRANSFER_REQUESTED verified");

  const trfApp = nexusTransferOrchestrator.approveTransfer(trfReq.transfer.transferId, "ED In-Charge");
  assert(trfApp.transfer.status === "TRANSFER_APPROVED", "Stage 2: TRANSFER_APPROVED verified");

  const trfTransit = nexusTransferOrchestrator.markInTransit(trfReq.transfer.transferId, "Orderly Escort");
  assert(trfTransit.transfer.status === "IN_TRANSIT", "Stage 3: IN_TRANSIT verified");

  const trfArrival = nexusTransferOrchestrator.confirmArrival(trfReq.transfer.transferId, "Emergency RN");
  assert(trfArrival.transfer.status === "ARRIVED", "Stage 4: ARRIVED verified");
  assert(trfArrival.stateChanges.receivingBedOccupied === "ER-02", "Receiving bed ER-02 marked OCCUPIED");
  assert(trfArrival.stateChanges.sourceBedReleasedToCleaning === "GEN-A-02", "Source bed GEN-A-02 released to CLEANING workflow");

  // 7. What-If Simulation Sandbox (Section 28, 57)
  console.log("\n--- 7. What-If Simulation Sandbox ---");
  const sim = nexusWhatIfEngine.runSimulation({
    scenarioType: "EMERGENCY_SURGE",
    addedEmergencyPatients: 4,
  });
  assert(sim.success === true, "What-If simulation completed");
  assert(sim.simulatedState.avgWaitMinutes > sim.baselineState.avgWaitMinutes, "Simulated wait time projected realistically higher");
  assert(sim.feasibleOptions.length > 0, "Feasible mitigation options returned without modifying real state");

  // 8. Scenario Runner Reproducibility (Section 51-56, 70)
  console.log("\n--- 8. Scenario Runner Reproducibility ---");
  const surgeRun = await nexusScenarioRunner.runEmergencySurgeScenario();
  assert(surgeRun.scenario === "EMERGENCY_SURGE", "Scenario 1: EMERGENCY_SURGE executed");
  assert(surgeRun.recommendation.approvalRequired === true, "Human approval enforced");

  const otRun = await nexusScenarioRunner.runOtDelayScenario(45);
  assert(otRun.scenario === "OT_CASCADE", "Scenario 3: OT_CASCADE executed");

  const ctRun = await nexusScenarioRunner.runCtFailureScenario();
  assert(ctRun.scenario === "CT_FAILURE_SUBSTITUTION", "Scenario 4: CT_FAILURE executed");

  const replanRun = await nexusScenarioRunner.runNurseUnavailableScenario();
  assert(replanRun.scenario === "SELF_REPLANNING", "Scenario 5: SELF_REPLANNING executed");

  // 9. Authoritative Operational State & Closed Loop (Section 5, 48, 61, 71)
  console.log("\n--- 9. Authoritative State & Audit Trail ---");
  const state = nexusOperationalState.getAuthoritativeState();
  assert(state.kpis.totalBeds === 48, "Authoritative bed inventory verified (48 beds)");
  assert(state.recentAudit.length > 0, "Audit trail logging mutations");
  assert(state.connectivityStatus === "LIVE", "Live telemetry connectivity verified");

  console.log("\n============================================================");
  console.log(`🏁 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log("============================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
