import ExcelJS from "exceljs";
import { Soldier } from "./soldiers";

interface ParsedImage {
  extension: "png" | "jpeg" | "gif";
  base64: string;
}

function parseBase64Image(dataURI: string): ParsedImage | null {
  if (!dataURI) return null;
  const parts = dataURI.split(";base64,");
  if (parts.length !== 2) return null;
  
  const mime = parts[0];
  const base64 = parts[1];
  
  const mimeMatches = mime.match(/^data:image\/([a-zA-Z0-9.-]+)$/);
  if (!mimeMatches) return null;
  
  let extension = mimeMatches[1].toLowerCase();
  if (extension === "jpg") {
    extension = "jpeg";
  }
  
  if (extension === "png" || extension === "jpeg" || extension === "gif") {
    return {
      extension,
      base64
    };
  }
  return null;
}

function generatePlaceholderPng(): string {
  if (typeof document === "undefined") return "";
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 100;
    canvas.height = 100;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    // Background: light gray rectangle matching the dashboard
    ctx.fillStyle = "#cbd5e1";
    ctx.fillRect(0, 0, 100, 100);

    // Avatar Head: dark gray circle
    ctx.fillStyle = "#94a3b8";
    ctx.beginPath();
    ctx.arc(50, 38, 18, 0, Math.PI * 2);
    ctx.fill();

    // Avatar Body: dark gray path
    ctx.beginPath();
    ctx.moveTo(15, 95);
    ctx.bezierCurveTo(20, 75, 40, 65, 50, 65);
    ctx.bezierCurveTo(60, 65, 80, 75, 85, 95);
    ctx.closePath();
    ctx.fill();

    return canvas.toDataURL("image/png");
  } catch (e) {
    console.error("Failed to generate placeholder PNG:", e);
    return "";
  }
}

export async function exportSoldiersToExcel(soldiers: Soldier[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Personnel Registry");

  // Configure worksheet columns with widths
  worksheet.columns = [
    { header: "Profile Photo", key: "photo", width: 12 },
    { header: "Service Number", key: "serviceNumber", width: 18 },
    { header: "Rank", key: "rank", width: 15 },
    { header: "Last Name", key: "lastName", width: 15 },
    { header: "First Name", key: "firstName", width: 15 },
    { header: "Date of Birth", key: "dateOfBirth", width: 15 },
    { header: "Gender", key: "gender", width: 10 },
    { header: "Nationality", key: "nationality", width: 15 },
    { header: "Unit Name", key: "unitName", width: 22 },
    { header: "Unit/Platoon", key: "unit", width: 15 },
    { header: "Role", key: "role", width: 18 },
    { header: "Date Enlisted", key: "dateEnlisted", width: 15 },
    { header: "Status", key: "status", width: 12 },
    { header: "Blood Type", key: "bloodType", width: 12 },
    { header: "Contact Phone", key: "contactPhone", width: 18 },
    { header: "Next of Kin Name", key: "nextOfKinName", width: 20 },
    { header: "Next of Kin Phone", key: "nextOfKinPhone", width: 18 },
    { header: "Batch", key: "batch", width: 12 },
    { header: "Notes", key: "notes", width: 25 },
    { header: "Created At", key: "createdAt", width: 22 }
  ];

  // Style the header row (Row 1)
  const headerRow = worksheet.getRow(1);
  headerRow.height = 30;
  headerRow.eachCell((cell) => {
    cell.font = {
      name: "Arial",
      family: 2,
      size: 11,
      bold: true,
      color: { argb: "FFFFFFFF" }
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0A1824" } // Sea blue / navy theme background
    };
    cell.alignment = {
      vertical: "middle",
      horizontal: "center",
      wrapText: true
    };
    cell.border = {
      top: { style: "thin", color: { argb: "FFCBD5E1" } },
      left: { style: "thin", color: { argb: "FFCBD5E1" } },
      bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
      right: { style: "thin", color: { argb: "FFCBD5E1" } }
    };
  });

  // Sort soldiers by Unit (Platoon) then Service Number
  const sorted = [...soldiers].sort((a, b) => {
    const unitCompare = (a.unit || "").localeCompare(b.unit || "");
    if (unitCompare !== 0) return unitCompare;
    return (a.serviceNumber || "").localeCompare(b.serviceNumber || "");
  });

  // Add data rows
  sorted.forEach((soldier) => {
    const rowData = {
      photo: "", // Will be filled dynamically by image overlay
      serviceNumber: soldier.serviceNumber || "",
      rank: soldier.rank || "",
      lastName: soldier.lastName || "",
      firstName: soldier.firstName || "",
      dateOfBirth: soldier.dateOfBirth || "",
      gender: soldier.gender || "",
      nationality: soldier.nationality || "",
      unitName: soldier.unitName || "",
      unit: soldier.unit || "",
      role: soldier.role || "",
      dateEnlisted: soldier.dateEnlisted || "",
      status: soldier.status || "",
      bloodType: soldier.bloodType || "",
      contactPhone: soldier.contactPhone || "",
      nextOfKinName: soldier.nextOfKinName || "",
      nextOfKinPhone: soldier.nextOfKinPhone || "",
      batch: soldier.batch || "",
      notes: soldier.notes || "",
      createdAt: soldier.createdAt ? new Date(soldier.createdAt).toLocaleDateString("en-GB") : ""
    };

    const row = worksheet.addRow(rowData);
    row.height = 60; // Height to accommodate the photo nicely

    // Style data cells
    row.eachCell((cell, colNumber) => {
      cell.font = {
        name: "Arial",
        family: 2,
        size: 10,
        color: { argb: "FF0F172A" } // slate-900
      };
      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 1 ? "center" : "left", // Center image in col 1
        wrapText: true
      };
      cell.border = {
        top: { style: "thin", color: { argb: "FFCBD5E1" } },
        left: { style: "thin", color: { argb: "FFCBD5E1" } },
        bottom: { style: "thin", color: { argb: "FFCBD5E1" } },
        right: { style: "thin", color: { argb: "FFCBD5E1" } }
      };
    });

    // Resolve photo URI. If empty or SVG placeholder (which Excel doesn't render),
    // generate a PNG placeholder dynamically on canvas so it displays correctly.
    let photoDataURI = soldier.photo || "";
    if (!photoDataURI || photoDataURI.startsWith("data:image/svg+xml")) {
      photoDataURI = generatePlaceholderPng();
    }

    if (photoDataURI && photoDataURI.startsWith("data:")) {
      const parsedImage = parseBase64Image(photoDataURI);
      if (parsedImage) {
        try {
          const imageId = workbook.addImage({
            base64: parsedImage.base64,
            extension: parsedImage.extension
          });

          // drawing row is 0-indexed, where Header (row number 1) is index 0.
          // The current data row index is row.number - 1.
          const rIndex = row.number - 1;

          worksheet.addImage(imageId, {
            tl: { col: 0.1, row: rIndex + 0.1 },
            br: { col: 0.9, row: rIndex + 0.9 },
            editAs: "oneCell"
          });
        } catch (e) {
          console.error("Failed to add image to Excel row:", row.number, e);
        }
      }
    }
  });

  // Write workbook to a buffer and trigger the browser download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement("a");
  a.href = url;
  a.download = `unit_registry_${new Date().toISOString().slice(0, 10)}.xlsx`;
  a.click();
  
  // Clean up URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
