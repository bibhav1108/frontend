import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * PDF Reporting Service
 * Generates professional humanitarian reports for SahyogSync
 */

const drawHeader = (doc, title, scopeName) => {
  const date = new Date().toLocaleDateString();
  
  // Branding
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(34, 197, 94); // SahyogSync Green
  doc.text("SahyogSync", 15, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${date}`, 155, 20);

  // Title
  doc.setFontSize(16);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text(title, 15, 35);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.setFont("helvetica", "italic");
  doc.text(`Scope: ${scopeName}`, 15, 42);
  doc.setTextColor(0);
  doc.setFont("helvetica", "normal");
};

const drawFooter = (doc) => {
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`SahyogSync Humanitarian Dashboard - Confidential Audit Data - Page ${i} of ${pageCount}`, 15, 285);
  }
};

export const generateCampaignReport = (data, scopeName) => {
  const doc = new jsPDF();
  const campaigns = Array.isArray(data) ? data : [data];
  const isIndividual = !Array.isArray(data);

  drawHeader(doc, "CAMPAIGN OPERATIONAL REPORT", scopeName);

  if (isIndividual) {
    const c = campaigns[0];
    autoTable(doc, {
      startY: 50,
      head: [["Field", "Details"]],
      body: [
        ["Campaign Name", c.name],
        ["Type", c.type],
        ["Status", c.status],
        ["Completion Date", new Date(c.created_at).toLocaleDateString()],
        ["Location", c.location_address || "N/A"],
        ["Target Goal", `${c.target_quantity} units`],
        ["Personnel Count", `${c.volunteers_required} members`],
        ["Expertise required", c.required_skills?.join(", ") || "General"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
    });

    if (c.description) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("Mission Narrative:", 15, doc.lastAutoTable.finalY + 10);
      doc.setFont("helvetica", "normal");
      const splitDescription = doc.splitTextToSize(c.description, 180);
      doc.text(splitDescription, 15, doc.lastAutoTable.finalY + 15);
    }
  } else {
    // Summary Metrics
    const totalCampaigns = campaigns.length;
    const totalVolunteers = campaigns.reduce((acc, c) => acc + (c.volunteers_required || 0), 0);
    
    autoTable(doc, {
      startY: 50,
      head: [["Metric", "Value"]],
      body: [
        ["Total Campaigns in Scope", totalCampaigns],
        ["Total Personnel Deployed", totalVolunteers],
      ],
      theme: "striped",
      headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    // Main Table
    const tableData = campaigns.map(c => [
      new Date(c.created_at).toLocaleDateString(),
      c.name,
      c.type,
      c.location_address || "N/A",
      `${c.target_quantity} units`
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Date", "Campaign Name", "Type", "Location", "Goal"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
    });
  }

  drawFooter(doc);
  doc.save(`SahyogSync_Campaign_${scopeName.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
};

export const generateDispatchReport = (data, scopeName) => {
  const doc = new jsPDF();
  const dispatches = Array.isArray(data) ? data : [data];
  const isIndividual = !Array.isArray(data);

  drawHeader(doc, "MARKETPLACE LOGISTICS REPORT", scopeName);

  if (isIndividual) {
    const d = dispatches[0];
    autoTable(doc, {
      startY: 50,
      head: [["Field", "Details"]],
      body: [
        ["Operation ID", `#${d.id}`],
        ["Item Category", d.item_type || "Supply"],
        ["Quantity", d.item_quantity || "N/A"],
        ["Assigned Personnel", d.volunteer_name || "Hero"],
        ["Pickup Location", d.pickup_address || "N/A"],
        ["Completion Time", new Date(d.created_at).toLocaleString()],
        ["Notes", d.description || "No additional notes"],
      ],
      theme: "striped",
      headStyles: { fillColor: [34, 197, 94] },
    });
  } else {
    // Summary Metrics
    const totalDispatches = dispatches.length;
    
    autoTable(doc, {
      startY: 50,
      head: [["Metric", "Value"]],
      body: [
        ["Total Operations in Scope", totalDispatches],
      ],
      theme: "striped",
      headStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: "bold" },
    });

    // Main Table
    const tableData = dispatches.map(d => [
      new Date(d.created_at).toLocaleDateString(),
      d.item_type || "Supply",
      d.item_quantity || "N/A",
      d.volunteer_name || "Hero",
      d.pickup_address || "N/A"
    ]);

    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 15,
      head: [["Date", "Item", "Qty", "Personnel", "Pickup Address"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
    });
  }

  drawFooter(doc);
  doc.save(`SahyogSync_Logistics_${scopeName.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
};
