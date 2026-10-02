// backend/services/nexusOperationalState.js
// Authoritative Operational State Layer, Conflict Detection, Audit Trail & Closed-Loop Engine for MediCare Nexus
// Coordinates Beds, Staff, Equipment, OT, Diagnostics, Emergencies, and Human Approvals

import { nexusStore } from "./nexusStore.js";
import { nexusConstraintOptimizer } from "./nexusConstraintOptimizer.js";
import { nexusDependencyGraph } from "./nexusDependencyGraph.js";
import { nexusTransferOrchestrator } from "./nexusTransferOrchestrator.js";
import { broadcastEvent } from "./eventHub.js";

export class NexusOperationalState {
  constructor() {
    this.conflicts = [];
    this.recommendations = [];
    this.auditLogs = [];
    this.orchestrationStage = "MONITOR"; // MONITOR | PREDICT | DETECT | IMPACT_ANALYSIS | OPTIMIZE | RECOMMEND | APPROVAL | ALLOCATE | REPLAN
    this.activeSimulations = [];

    this.initDefaultConflictsAndRecommendations();
    this.initDefaultAuditLogs();
  }

  initDefaultConflictsAndRecommendations() {
    // Section 47 Conflict Example
    this.conflicts = [
      {
        conflictId: "CONF-ICU-12",
        resourceType: "BED",
        resourceId: "ICU-05",
        department: "ICU",
        sourceA: {
          system: "Telemetry Bed Sensor Subsystem",
          reportedStatus: "AVAILABLE",
          timestamp: new Date(Date.now() - 120000).toISOString(),
          details: "Pressure sensors report zero physical load (Weight: 0.0 kg).",
        },
        sourceB: {
          system: "Hospital Admission Registration (ADT)",
          reportedStatus: "OCCUPIED",
          timestamp: new Date(Date.now() - 300000).toISOString(),
          details: "Patient P-104 reserved / checked-in via emergency triage registration.",
        },
        status: "OPEN",
        discrepancyDescription: "ICU-05 has conflicting occupancy: Physical Sensor reports AVAILABLE, but ADT reports OCCUPIED.",
        resolvedBy: null,
        resolvedAt: null,
        resolutionAction: null,
        finalStatus: null,
      },
    ];

    // Section 58 Recommendation Cards
    this.recommendations = [
      {
        recommendationId: "REC-NEXUS-001",
        title: "Reallocate Nurse Sarah Jenkins (N-07) to Emergency Resuscitation",
        action: "STAFF_REALLOCATION",
        resourceId: "N-07",
        resourceName: "Nurse Sarah Jenkins (N-07)",
        resourceType: "STAFF",
        fromDepartment: "General Ward",
        toDepartment: "Emergency Department",
        targetPatientId: "P-104",
        reason: "Emergency staffing deficit = 1 nurse due to critical acute STEMI Code Red patient triage.",
        constraintChecks: [
          { rule: "ACLS & Trauma Qualification", passed: true, detail: "Certified Senior Emergency & Critical Care RN" },
          { rule: "Active Shift Check", passed: true, detail: "On-duty morning shift (08:00 - 20:00)" },
          { rule: "No Active Critical Task Conflict", passed: true, detail: "Currently performing routine monitoring (not locked in surgery)" },
          { rule: "General Ward Minimum-Capacity Preserved", passed: true, detail: "General Ward: 6 current - 4 required - 1 buffer = 1 releasable nurse" },
          { rule: "Secondary Bottleneck Prevention", passed: true, detail: "Simulated General Ward capacity post-reallocation satisfies safe threshold" },
        ],
        operationalImpact: {
          recipientGain: "Immediate emergency nursing coverage restored; vital triage response time reduced.",
          donorImpact: "General Ward nursing ratio remains above regulatory safety mandate (5 nurses on duty).",
          bufferPreserved: true,
          secondaryRisks: ["Monitor General Ward if 2+ new elective admissions arrive within 90 minutes."],
        },
        confidenceScore: 96,
        riskLevel: "LOW",
        approvalRequired: true,
        status: "PENDING",
        approvedBy: null,
        approvedAt: null,
        rejectedReason: null,
        createdAt: new Date().toISOString(),
        alternatives: [
          { resourceId: "N-08", resourceName: "Nurse Anita Roy", score: 86, tradeoff: "Emergency RN already holding medium triage load" },
        ],
      },
      {
        recommendationId: "REC-NEXUS-002",
        title: "Dynamic Radiology Queue Re-balancing: X-Ray Suite 1 -> Suite 2",
        action: "DIAGNOSTIC_REROUTE",
        resourceId: "DIAG-XR-01",
        resourceName: "Digital X-Ray Suite 1",
        resourceType: "DIAGNOSTIC",
        fromDepartment: "Diagnostics Suite 1",
        toDepartment: "Diagnostics Suite 2 (Fast-Track)",
        reason: "Suite 1 queue length exceeded 7 patients (38 min wait). Suite 2 has zero wait time.",
        constraintChecks: [
          { rule: "Equipment Compatibility", passed: true, detail: "Both suites share identical digital radiography detectors" },
          { rule: "Technician Staffing Available", passed: true, detail: "Technician on-duty in Fast-Track Suite 2" },
        ],
        operationalImpact: {
          recipientGain: "Average wait time across diagnostic wing drops from 38 min to 12 min.",
          donorImpact: "Suite 1 queue load reduced by 55%.",
          bufferPreserved: true,
        },
        confidenceScore: 98,
        riskLevel: "LOW",
        approvalRequired: false,
        status: "APPROVED",
        approvedBy: "Autonomous Load Balancer",
        approvedAt: new Date().toISOString(),
        createdAt: new Date(Date.now() - 180000).toISOString(),
      },
    ];
  }

  initDefaultAuditLogs() {
    this.auditLogs = [
      {
        auditId: `AUD-${Date.now().toString().slice(-6)}`,
        timestamp: new Date(Date.now() - 300000).toISOString(),
        actor: "Emergency Triage Nurse",
        actorRole: "STAFF",
        action: "EMERGENCY_CREATED",
        resourceType: "PATIENT",
        resourceId: "P-104",
        patientId: "P-104",
        department: "Emergency",
        oldValue: "TRIAGE_QUEUE",
        newValue: "CODE_RED_ACTIVE",
        reason: "Patient registered with SpO2: 82%, HR: 142 bpm (Acute STEMI).",
        source: "EMERGENCY_DEPT_RIS",
        recommendationId: null,
        approvalStatus: "AUTOMATIC",
        executionResult: "SUCCESS",
      },
      {
        auditId: `AUD-${(Date.now() - 1000).toString().slice(-6)}`,
        timestamp: new Date(Date.now() - 250000).toISOString(),
        actor: "Nexus Autonomous Optimizer",
        actorRole: "SYSTEM",
        action: "RECOMMENDATION_CREATED",
        resourceType: "STAFF",
        resourceId: "N-07",
        patientId: "P-104",
        department: "ICU / General",
        oldValue: "ROUTINE_MONITORING",
        newValue: "REALLOCATION_RECOMMENDED",
        reason: "Staffing deficit in Emergency addressed via General Ward releasable buffer.",
        source: "NEXUS_OPTIMIZER",
        recommendationId: "REC-NEXUS-001",
        approvalStatus: "PENDING_APPROVAL",
        executionResult: "SUCCESS",
      },
    ];
  }

  /**
   * Authoritative Complete Hospital Operational State (Section 5)
   */
  getAuthoritativeState() {
    const totalBeds = nexusStore.beds.length;
    const occupiedBeds = nexusStore.beds.filter((b) => b.status === "OCCUPIED").length;
    const availableBeds = nexusStore.beds.filter((b) => b.status === "AVAILABLE").length;
    const cleaningBeds = nexusStore.beds.filter((b) => b.status === "CLEANING").length;
    const reservedBeds = nexusStore.beds.filter((b) => b.status === "RESERVED").length;
    const icuTotal = nexusStore.beds.filter((b) => b.wardId === "WARD-ICU").length;
    const icuOccupied = nexusStore.beds.filter((b) => b.wardId === "WARD-ICU" && b.status === "OCCUPIED").length;

    // Staffing calculations with Staff Estimation layer
    const totalStaff = nexusStore.staff.length;
    const onDutyStaff = nexusStore.staff.filter((s) => s.status === "ON_DUTY" || s.status === "AVAILABLE").length;
    const doctorsOnDuty = nexusStore.staff.filter((s) => s.role === "Doctor" || s.role === "Surgeon").length;
    const nursesOnDuty = nexusStore.staff.filter((s) => s.role === "Nurse").length;

    // Departmental staffing breakdown with minimum capacity checks
    const generalStaffEstimate = nexusConstraintOptimizer.estimateStaffRequirement({
      department: "General",
      patientCount: 11,
      activeStaffCount: 6,
    });

    const emergencyStaffEstimate = nexusConstraintOptimizer.estimateStaffRequirement({
      department: "Emergency",
      patientCount: 19,
      activeStaffCount: 2,
      emergencySurgeActive: true,
    });

    return {
      timestamp: new Date().toISOString(),
      timezone: "Asia/Kolkata",
      orchestrationStage: this.orchestrationStage,
      kpis: {
        totalBeds,
        occupiedBeds,
        availableBeds,
        cleaningBeds,
        reservedBeds,
        bedOccupancyRate: Math.round((occupiedBeds / totalBeds) * 100),
        icuTotal,
        icuOccupied,
        icuAvailable: icuTotal - icuOccupied,
        icuOccupancyRate: Math.round((icuOccupied / icuTotal) * 100),
        totalStaff,
        onDutyStaff,
        doctorsOnDuty,
        nursesOnDuty,
        totalOTs: nexusStore.operatingTheatres.length,
        availableOTs: nexusStore.operatingTheatres.filter((o) => o.status === "AVAILABLE").length,
        otUtilizationRate: Math.round(
          (nexusStore.operatingTheatres.filter((o) => o.status === "OCCUPIED" || o.status === "IN_USE").length /
            nexusStore.operatingTheatres.length) *
            100
        ),
        activeEmergenciesCount: nexusStore.emergencies.filter((e) => e.status === "ACTIVE").length,
        openConflictsCount: this.conflicts.filter((c) => c.status === "OPEN").length,
        pendingRecommendationsCount: this.recommendations.filter((r) => r.status === "PENDING").length,
      },
      staffingAnalysis: {
        generalWard: generalStaffEstimate,
        emergencyDepartment: emergencyStaffEstimate,
      },
      resources: {
        wards: nexusStore.wards,
        beds: nexusStore.beds,
        staff: nexusStore.staff,
        equipment: nexusStore.equipment,
        operatingTheatres: nexusStore.operatingTheatres,
        diagnostics: nexusStore.diagnostics,
        emergencies: nexusStore.emergencies,
        transfers: nexusTransferOrchestrator.getTransfers(),
        rtlsLocations: nexusStore.rtlsLocations,
        forecasts: nexusStore.forecasts,
        alerts: nexusStore.alerts,
        conflicts: this.conflicts,
        recommendations: this.recommendations,
      },
      dependencyGraph: nexusDependencyGraph.getSerializedGraph(),
      recentAudit: this.auditLogs.slice(0, 15),
      connectivityStatus: "LIVE",
    };
  }

  /**
   * Set closed-loop orchestration stage
   */
  setOrchestrationStage(stage) {
    this.orchestrationStage = stage;
    broadcastEvent("orchestrationStatusChanged", { stage, timestamp: new Date().toISOString() });
  }

  /**
   * Approve a human-in-the-loop recommendation (Section 29)
   */
  approveRecommendation(recommendationId, approvedBy = "Hospital Operations Supervisor") {
    const rec = this.recommendations.find((r) => r.recommendationId === recommendationId);
    if (!rec) return { success: false, message: "Recommendation not found" };

    rec.status = "APPROVED";
    rec.approvedBy = approvedBy;
    rec.approvedAt = new Date().toISOString();

    // Execute recommended action
    if (rec.action === "STAFF_REALLOCATION") {
      const staffMember = nexusStore.staff.find((s) => s.staffId === rec.resourceId);
      if (staffMember) {
        staffMember.status = "REALLOCATED";
        staffMember.currentWard = rec.toDepartment === "Emergency Department" ? "WARD-EMG" : rec.toDepartment;
        staffMember.currentAssignment = `Emergency Rapid Response (Transferred from ${rec.fromDepartment})`;
        staffMember.workloadScore = Math.min(85, (staffMember.workloadScore || 30) + 20);
      }
    }

    rec.status = "EXECUTED";
    rec.executedAt = new Date().toISOString();
    rec.executionResult = "Successfully deployed resource to receiving unit";

    // Record audit
    this.recordAudit({
      actor: approvedBy,
      actorRole: "SUPERVISOR",
      action: "RECOMMENDATION_APPROVED",
      resourceType: rec.resourceType,
      resourceId: rec.resourceId,
      department: rec.toDepartment,
      oldValue: "PENDING_APPROVAL",
      newValue: "EXECUTED",
      reason: rec.reason,
      recommendationId: rec.recommendationId,
      approvalStatus: "HUMAN_APPROVED",
    });

    this.setOrchestrationStage("REPLAN");

    broadcastEvent("recommendationExecuted", { recommendation: rec });
    return { success: true, recommendation: rec };
  }

  /**
   * Reject a human-in-the-loop recommendation (Section 29)
   */
  rejectRecommendation(recommendationId, rejectedBy = "Hospital Operations Supervisor", reason = "Operational override by clinical supervisor") {
    const rec = this.recommendations.find((r) => r.recommendationId === recommendationId);
    if (!rec) return { success: false, message: "Recommendation not found" };

    rec.status = "REJECTED";
    rec.rejectedBy = rejectedBy;
    rec.rejectedAt = new Date().toISOString();
    rec.rejectionReason = reason;

    this.recordAudit({
      actor: rejectedBy,
      actorRole: "SUPERVISOR",
      action: "RECOMMENDATION_REJECTED",
      resourceType: rec.resourceType,
      resourceId: rec.resourceId,
      department: rec.fromDepartment,
      oldValue: "PENDING_APPROVAL",
      newValue: "REJECTED",
      reason,
      recommendationId: rec.recommendationId,
      approvalStatus: "HUMAN_REJECTED",
    });

    broadcastEvent("recommendationRejected", { recommendationId, reason });
    return { success: true, recommendation: rec };
  }

  /**
   * Resolve a conflicting resource state (Section 47)
   */
  resolveConflict(conflictId, resolvedBy = "Chief Nursing Supervisor", resolutionChoice = "MARK_OCCUPIED", reason = "Physical bed check confirms patient in bed") {
    const conflict = this.conflicts.find((c) => c.conflictId === conflictId);
    if (!conflict) return { success: false, message: "Conflict record not found" };

    conflict.status = "RESOLVED";
    conflict.resolvedBy = resolvedBy;
    conflict.resolvedAt = new Date().toISOString();
    conflict.resolutionAction = resolutionChoice;
    conflict.resolutionReason = reason;
    conflict.finalStatus = resolutionChoice === "MARK_OCCUPIED" ? "OCCUPIED" : "AVAILABLE";

    // Synchronize authoritative resource
    if (conflict.resourceType === "BED") {
      const bed = nexusStore.beds.find((b) => b.bedId === conflict.resourceId);
      if (bed) {
        bed.status = conflict.finalStatus;
        bed.verificationRequired = false;
        bed.lastVerifiedAt = new Date().toISOString();
      }
    }

    this.recordAudit({
      actor: resolvedBy,
      actorRole: "SUPERVISOR",
      action: "RESOURCE_CONFLICT_RESOLVED",
      resourceType: conflict.resourceType,
      resourceId: conflict.resourceId,
      department: conflict.department,
      oldValue: "CONFLICT_OPEN",
      newValue: conflict.finalStatus,
      reason,
      recommendationId: null,
      approvalStatus: "MANUALLY_RESOLVED",
    });

    broadcastEvent("conflictResolved", { conflictId, finalStatus: conflict.finalStatus, resolvedBy });
    return { success: true, conflict };
  }

  /**
   * Record an immutable audit log entry (Section 48)
   */
  recordAudit(entry) {
    const auditId = `AUD-${Date.now().toString().slice(-6)}`;
    const log = {
      auditId,
      timestamp: new Date().toISOString(),
      source: "NEXUS_ORCHESTRATOR",
      executionResult: "SUCCESS",
      ...entry,
    };
    this.auditLogs.unshift(log);
    return log;
  }

  getAuditLogs(limit = 50) {
    return this.auditLogs.slice(0, limit);
  }
}

export const nexusOperationalState = new NexusOperationalState();
