// backend/services/nexusDependencyGraph.js
// Multi-Resource Dependency Graph & Cascading Impact Detection Engine for MediCare Nexus
// Implements: Resource -> Dependent Workflow -> Affected Resource graph traversal and impact calculation.

export class NexusDependencyGraph {
  constructor() {
    // Internal adjacency representation of hospital resource dependencies
    this.graph = new Map();
    this.initDefaultGraph();
  }

  initDefaultGraph() {
    // 1. Operating Theatre Dependencies (OT-01, OT-02, OT-03, OT-04)
    this.addDependency({
      sourceId: "OT-02",
      sourceType: "OPERATING_THEATRE",
      sourceName: "OT Suite 2 (Emergency Trauma)",
      dependentWorkflow: "Emergency Laparotomy / Trauma Surgery",
      targetId: "BED-SURG-01",
      targetType: "BED",
      targetName: "Surgical Recovery Bed SURG-01",
      impactType: "CAPACITY_LOCK",
      severity: "HIGH",
      delayMultiplier: 1.0,
      description: "Delayed surgery closure locks Surgical Recovery Bed from accepting subsequent post-op patients.",
    });

    this.addDependency({
      sourceId: "OT-02",
      sourceType: "OPERATING_THEATRE",
      sourceName: "OT Suite 2 (Emergency Trauma)",
      dependentWorkflow: "Next Scheduled Elective Procedure",
      targetId: "DOC-03",
      targetType: "STAFF",
      targetName: "Dr. Rajesh Gupta (Lead Trauma Surgeon)",
      impactType: "DELAY_CASCADE",
      severity: "MEDIUM",
      delayMultiplier: 1.0,
      description: "Surgeon roster shifts backwards, delaying upcoming elective joint and abdominal cases.",
    });

    this.addDependency({
      sourceId: "BED-SURG-01",
      sourceType: "BED",
      sourceName: "Surgical Recovery Bed SURG-01",
      dependentWorkflow: "Post-Anesthesia Care Unit (PACU) Handoff",
      targetId: "N-09",
      targetType: "STAFF",
      targetName: "Nurse Marcus Vance (Surgical Recovery RN)",
      impactType: "WORKLOAD_SPIKE",
      severity: "HIGH",
      delayMultiplier: 1.2,
      description: "Prolonged intensive recovery monitoring increases nursing nurse-to-patient ratio.",
    });

    this.addDependency({
      sourceId: "BED-SURG-01",
      sourceType: "BED",
      sourceName: "Surgical Recovery Bed SURG-01",
      dependentWorkflow: "General Inpatient Step-Down",
      targetId: "WARD-GEN-A",
      targetType: "WARD",
      targetName: "General Inpatient Ward A",
      impactType: "BOTTLENECK",
      severity: "MEDIUM",
      delayMultiplier: 0.8,
      description: "Inpatient admission hold: General ward bed reservations held awaiting post-op transfer.",
    });

    // 2. Diagnostic Dependencies (CT-01, MRI-01, X-Ray)
    this.addDependency({
      sourceId: "DIAG-CT-01",
      sourceType: "DIAGNOSTIC",
      sourceName: "Siemens 128-Slice CT Scanner",
      dependentWorkflow: "Code Stroke & Trauma Neuro-Imaging",
      targetId: "WARD-EMG",
      targetType: "DEPARTMENT",
      targetName: "Emergency Department Triage",
      impactType: "BOTTLENECK",
      severity: "CRITICAL",
      delayMultiplier: 1.5,
      description: "Emergency acute stroke pathway stalled; door-to-needle thrombolytic window at risk.",
    });

    this.addDependency({
      sourceId: "DIAG-CT-01",
      sourceType: "DIAGNOSTIC",
      sourceName: "Siemens 128-Slice CT Scanner",
      dependentWorkflow: "Diagnostic Queue Progression",
      targetId: "TECH-01",
      targetType: "STAFF",
      targetName: "Karan Verma (Radiology Technician)",
      impactType: "WORKLOAD_SPIKE",
      severity: "HIGH",
      delayMultiplier: 1.0,
      description: "Technician must manually re-position patients and verify alternate scanner calibration.",
    });

    this.addDependency({
      sourceId: "WARD-EMG",
      sourceType: "DEPARTMENT",
      sourceName: "Emergency Department Triage",
      dependentWorkflow: "Emergency Bay Patient Dwell Time",
      targetId: "ER-01",
      targetType: "BED",
      targetName: "Emergency Resuscitation Bay ER-01",
      impactType: "CAPACITY_LOCK",
      severity: "HIGH",
      delayMultiplier: 1.3,
      description: "Delayed radiological clearance extends ER bay occupancy, preventing incoming ambulances from offloading.",
    });

    // 3. Equipment & Critical Bed Dependencies
    this.addDependency({
      sourceId: "ICU-05",
      sourceType: "BED",
      sourceName: "Isolation Resuscitation Bed ICU-05",
      dependentWorkflow: "Critical Cardiac Telemetry Care",
      targetId: "V-04",
      targetType: "EQUIPMENT",
      targetName: "Hamilton G5 Ventilator (V-04)",
      impactType: "CAPACITY_LOCK",
      severity: "CRITICAL",
      delayMultiplier: 1.0,
      description: "Bed downtime requires synchronized disconnection and transfer of active mechanical ventilator.",
    });
  }

  addDependency(dep) {
    if (!this.graph.has(dep.sourceId)) {
      this.graph.set(dep.sourceId, []);
    }
    this.graph.get(dep.sourceId).push(dep);
  }

  /**
   * Traverse graph and compute full cascading impact on an exception
   * @param {string} sourceResourceId
   * @param {object} eventDetails
   */
  analyzeCascadingImpact(sourceResourceId, eventDetails = {}) {
    const primaryImpacts = [];
    const secondaryImpacts = [];
    const affectedResources = new Set();
    const visited = new Set();

    affectedResources.add(sourceResourceId);

    const directEdges = this.graph.get(sourceResourceId) || [];
    for (const edge of directEdges) {
      primaryImpacts.push({
        sourceResource: edge.sourceName || edge.sourceId,
        dependentWorkflow: edge.dependentWorkflow,
        affectedResource: edge.targetName || edge.targetId,
        targetId: edge.targetId,
        impactType: edge.impactType,
        severity: edge.severity,
        description: edge.description,
        estimatedDelayMinutes: Math.round((eventDetails.delayMinutes || 45) * edge.delayMultiplier),
      });
      affectedResources.add(edge.targetId);
      visited.add(edge.targetId);

      // Traverse 2nd order downstream dependencies (Secondary Impact)
      const secondaryEdges = this.graph.get(edge.targetId) || [];
      for (const sEdge of secondaryEdges) {
        if (!visited.has(sEdge.targetId)) {
          secondaryImpacts.push({
            cascadeParent: edge.targetName || edge.targetId,
            dependentWorkflow: sEdge.dependentWorkflow,
            affectedResource: sEdge.targetName || sEdge.targetId,
            targetId: sEdge.targetId,
            impactType: sEdge.impactType,
            severity: sEdge.severity,
            description: sEdge.description,
            estimatedDelayMinutes: Math.round(
              (eventDetails.delayMinutes || 45) * edge.delayMultiplier * sEdge.delayMultiplier * 0.8
            ),
          });
          affectedResources.add(sEdge.targetId);
          visited.add(sEdge.targetId);
        }
      }
    }

    // Generate actionable mitigation alternatives
    const mitigations = [];
    if (sourceResourceId.includes("OT")) {
      mitigations.push({
        strategy: "Dynamic Slot Swap & Recovery Buffer Release",
        action: "Shift non-urgent elective prep by 45 minutes; release PACU recovery bay SURG-03 as overflow.",
        feasibilityScore: 92,
      });
      mitigations.push({
        strategy: "Standby Surgical Team Pre-alert",
        action: "Mobilize on-call surgical nurse to relieve Nurse Marcus Vance (workload reduction).",
        feasibilityScore: 88,
      });
    } else if (sourceResourceId.includes("CT")) {
      mitigations.push({
        strategy: "Automated PACS Re-routing to CT-02",
        action: "Direct pending emergency CT neuro-scans to Suite 2; notify ER triage to resume stroke intake.",
        feasibilityScore: 96,
      });
    } else {
      mitigations.push({
        strategy: "Automated Resuscitation Bay Reallocation",
        action: `Shift telemetry and respiratory monitoring from ${sourceResourceId} to verified standby bay.`,
        feasibilityScore: 94,
      });
    }

    return {
      sourceResourceId,
      eventType: eventDetails.eventType || "RESOURCE_EXCEPTION",
      totalAffectedResources: affectedResources.size,
      affectedResourceIds: Array.from(affectedResources),
      primaryImpacts,
      secondaryImpacts,
      mitigationAlternatives: mitigations,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Return full graph for interactive visual diagram in UI
   */
  getSerializedGraph() {
    const nodes = [];
    const links = [];
    const addedNodeIds = new Set();

    for (const [sourceId, edges] of this.graph.entries()) {
      for (const edge of edges) {
        if (!addedNodeIds.has(edge.sourceId)) {
          nodes.push({
            id: edge.sourceId,
            name: edge.sourceName || edge.sourceId,
            type: edge.sourceResourceType,
            status: "MONITORED",
          });
          addedNodeIds.add(edge.sourceId);
        }
        if (!addedNodeIds.has(edge.targetId)) {
          nodes.push({
            id: edge.targetId,
            name: edge.targetName || edge.targetId,
            type: edge.targetResourceType,
            status: "DEPENDENT",
          });
          addedNodeIds.add(edge.targetId);
        }
        links.push({
          source: edge.sourceId,
          target: edge.targetId,
          workflow: edge.dependentWorkflow,
          impactType: edge.impactType,
          severity: edge.severity,
          description: edge.description,
        });
      }
    }

    return { nodes, links };
  }
}

export const nexusDependencyGraph = new NexusDependencyGraph();
