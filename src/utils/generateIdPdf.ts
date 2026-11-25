import { jsPDF } from 'jspdf';
import type { StudentApplication } from '../types';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function truncateText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let truncated = text;
  while (truncated.length > 0 && ctx.measureText(`${truncated}…`).width > maxWidth) {
    truncated = truncated.slice(0, -1);
  }
  return `${truncated}…`;
}

export async function downloadStudentIdPdf(app: StudentApplication): Promise<void> {
  const scale = 3;
  const cardWidth = 640;
  const cardHeight = 404;

  // Front canvas
  const frontCanvas = document.createElement('canvas');
  frontCanvas.width = cardWidth * scale;
  frontCanvas.height = cardHeight * scale;
  const ctx = frontCanvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = '#FFFFFF';
  drawRoundedRect(ctx, 0, 0, cardWidth, cardHeight, 20);
  ctx.fill();
  ctx.save();
  drawRoundedRect(ctx, 0, 0, cardWidth, cardHeight, 20);
  ctx.clip();

  // Header gradient
  const grad = ctx.createLinearGradient(0, 0, cardWidth, 0);
  grad.addColorStop(0, '#1E3A8A');
  grad.addColorStop(1, '#1D4ED8');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, cardWidth, 88);

  // Crest emblem circle + shield
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.4;
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.beginPath();
  ctx.moveTo(46, 20);
  ctx.lineTo(26, 28);
  ctx.lineTo(26, 44);
  ctx.quadraticCurveTo(26, 60, 46, 68);
  ctx.quadraticCurveTo(66, 60, 66, 44);
  ctx.lineTo(66, 28);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cap inside shield
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.moveTo(46, 33);
  ctx.lineTo(34, 39);
  ctx.lineTo(46, 45);
  ctx.lineTo(58, 39);
  ctx.closePath();
  ctx.fill();

  // College Name
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 21px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(truncateText(ctx, app.collegeName, 410), 82, 43);

  ctx.fillStyle = '#DBEAFE';
  ctx.font = '500 13px "Public Sans", Arial, sans-serif';
  ctx.fillText('OFFICIAL STUDENT IDENTITY CARD', 82, 65);

  ctx.fillStyle = '#DBEAFE';
  ctx.font = '600 13px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(app.academicYear, cardWidth - 26, 45);
  ctx.textAlign = 'left';

  // Photo box
  const photoX = 28;
  const photoY = 112;
  const photoW = 136;
  const photoH = 166;
  ctx.fillStyle = '#F1F5F9';
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 10);
  ctx.fill();

  const photoImg = await loadImage(app.photoDataUrl);
  if (photoImg) {
    ctx.save();
    drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 10);
    ctx.clip();
    const imgRatio = photoImg.width / photoImg.height;
    const boxRatio = photoW / photoH;
    let drawW = photoW;
    let drawH = photoH;
    let offsetX = photoX;
    let offsetY = photoY;
    if (imgRatio > boxRatio) {
      drawW = photoH * imgRatio;
      offsetX = photoX - (drawW - photoW) / 2;
    } else {
      drawH = photoW / imgRatio;
      offsetY = photoY - (drawH - photoH) / 2;
    }
    ctx.drawImage(photoImg, offsetX, offsetY, drawW, drawH);
    ctx.restore();
  }
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  drawRoundedRect(ctx, photoX, photoY, photoW, photoH, 10);
  ctx.stroke();

  // Student info column
  const infoX = 186;
  ctx.fillStyle = '#64748B';
  ctx.font = '500 12px "Public Sans", Arial, sans-serif';
  ctx.fillText('Student Name', infoX, 128);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 23px "Plus Jakarta Sans", Arial, sans-serif';
  ctx.fillText(truncateText(ctx, app.fullName, 420), infoX, 154);

  // Student ID & Reg No
  ctx.fillStyle = '#64748B';
  ctx.font = '500 12px "Public Sans", Arial, sans-serif';
  ctx.fillText('Student ID Number', infoX, 188);
  ctx.fillText('Registration Number', infoX + 215, 188);

  ctx.fillStyle = '#1E40AF';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(app.studentIdNumber, infoX, 210);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px monospace';
  ctx.fillText(app.regNumber, infoX + 215, 210);

  // Department
  ctx.fillStyle = '#64748B';
  ctx.font = '500 12px "Public Sans", Arial, sans-serif';
  ctx.fillText('Department', infoX, 242);

  ctx.fillStyle = '#1E293B';
  ctx.font = '600 15px "Public Sans", Arial, sans-serif';
  ctx.fillText(truncateText(ctx, app.department, 420), infoX, 264);

  // Divider line
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(28, 296);
  ctx.lineTo(cardWidth - 28, 296);
  ctx.stroke();

  // Course & Validity
  ctx.fillStyle = '#64748B';
  ctx.font = '500 11px "Public Sans", Arial, sans-serif';
  ctx.fillText('Course / Degree', 28, 316);
  ctx.fillText('Valid Thru', cardWidth - 130, 316);

  ctx.fillStyle = '#0F172A';
  ctx.font = '600 15px "Public Sans", Arial, sans-serif';
  ctx.fillText(truncateText(ctx, app.course, 450), 28, 336);

  ctx.font = '600 15px monospace';
  ctx.fillText(app.validityDate, cardWidth - 130, 336);

  // Bottom footer bar
  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 354, cardWidth, 50);
  ctx.strokeStyle = '#E2E8F0';
  ctx.beginPath();
  ctx.moveTo(0, 354);
  ctx.lineTo(cardWidth, 354);
  ctx.stroke();

  ctx.fillStyle = '#475569';
  ctx.font = '500 12px "Public Sans", Arial, sans-serif';
  const bloodText = app.bloodGroup ? `  ·  Blood Group: ${app.bloodGroup}` : '';
  ctx.fillText(`Academic Year ${app.academicYear}${bloodText}`, 28, 384);

  // Barcode on right
  let bx = cardWidth - 190;
  for (let i = 0; i < 30; i++) {
    const code = app.studentIdNumber.charCodeAt(i % app.studentIdNumber.length) || 65;
    const bw = ((code + i * 7) % 3) + 1.5;
    const gap = ((code + i * 3) % 2) + 1.5;
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(bx, 366, bw, 24);
    bx += bw + gap;
    if (bx > cardWidth - 28) break;
  }

  ctx.restore();
  // Outer card border
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  drawRoundedRect(ctx, 1, 1, cardWidth - 2, cardHeight - 2, 20);
  ctx.stroke();

  // Back Canvas
  const backCanvas = document.createElement('canvas');
  backCanvas.width = cardWidth * scale;
  backCanvas.height = cardHeight * scale;
  const bctx = backCanvas.getContext('2d');
  if (!bctx) return;

  bctx.scale(scale, scale);
  bctx.fillStyle = '#FFFFFF';
  drawRoundedRect(bctx, 0, 0, cardWidth, cardHeight, 20);
  bctx.fill();
  bctx.save();
  drawRoundedRect(bctx, 0, 0, cardWidth, cardHeight, 20);
  bctx.clip();

  bctx.fillStyle = '#0F172A';
  bctx.fillRect(0, 0, cardWidth, 58);

  bctx.fillStyle = '#F8FAFC';
  bctx.font = '600 14px "Plus Jakarta Sans", Arial, sans-serif';
  bctx.fillText('STUDENT HOLDER DETAILS & VERIFICATION', 28, 35);

  bctx.fillStyle = '#CBD5E1';
  bctx.font = '500 12px monospace';
  bctx.textAlign = 'right';
  bctx.fillText(app.referenceNumber, cardWidth - 28, 35);
  bctx.textAlign = 'left';

  bctx.fillStyle = '#64748B';
  bctx.font = '500 12px "Public Sans", Arial, sans-serif';
  bctx.fillText('Date of Birth', 28, 96);
  bctx.fillText('Year & Semester', 220, 96);
  bctx.fillText('Emergency Contact', 430, 96);

  bctx.fillStyle = '#0F172A';
  bctx.font = '600 14px monospace';
  bctx.fillText(app.dob, 28, 118);
  bctx.font = '600 14px "Public Sans", Arial, sans-serif';
  bctx.fillText(`${app.yearOfStudy} · ${app.semester}`, 220, 118);
  bctx.font = '600 14px monospace';
  bctx.fillText(app.mobile, 430, 118);

  bctx.fillStyle = '#64748B';
  bctx.font = '500 12px "Public Sans", Arial, sans-serif';
  bctx.fillText('Email Address', 28, 160);
  bctx.fillStyle = '#0F172A';
  bctx.font = '500 14px "Public Sans", Arial, sans-serif';
  bctx.fillText(app.email, 28, 180);

  bctx.fillStyle = '#64748B';
  bctx.font = '500 12px "Public Sans", Arial, sans-serif';
  bctx.fillText('Residential Address', 28, 218);
  bctx.fillStyle = '#1E293B';
  bctx.font = '500 14px "Public Sans", Arial, sans-serif';
  bctx.fillText(truncateText(bctx, app.address, 580), 28, 238);

  bctx.fillStyle = '#F8FAFC';
  drawRoundedRect(bctx, 28, 268, cardWidth - 56, 72, 10);
  bctx.fill();
  bctx.strokeStyle = '#E2E8F0';
  bctx.lineWidth = 1;
  bctx.stroke();

  bctx.fillStyle = '#475569';
  bctx.font = '400 12px "Public Sans", Arial, sans-serif';
  bctx.fillText(
    `This identification card is non-transferable and remains the property of ${app.collegeName}.`,
    44,
    296
  );
  bctx.fillText(
    'If found, please return to the Office of the Registrar or email idcard-support@studentportal.edu.',
    44,
    318
  );

  bctx.fillStyle = '#F1F5F9';
  bctx.fillRect(0, 354, cardWidth, 50);
  bctx.fillStyle = '#475569';
  bctx.font = '600 12px "Public Sans", Arial, sans-serif';
  bctx.fillText(`Status: ${app.status} · Authorized Digital Issue`, 28, 384);
  bctx.textAlign = 'right';
  bctx.font = '500 12px monospace';
  bctx.fillText(`Valid Thru ${app.validityDate}`, cardWidth - 28, 384);
  bctx.textAlign = 'left';

  bctx.restore();
  bctx.strokeStyle = '#CBD5E1';
  bctx.lineWidth = 2;
  drawRoundedRect(bctx, 1, 1, cardWidth - 2, cardHeight - 2, 20);
  bctx.stroke();

  // Assemble A4 PDF document
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(16);
  pdf.setTextColor(15, 23, 42);
  pdf.text('Official Student Identification Card', 20, 22);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.setTextColor(71, 85, 105);
  pdf.text(
    `Reference: ${app.referenceNumber}   |   Student ID: ${app.studentIdNumber}   |   Status: ${app.status}`,
    20,
    30
  );

  pdf.setDrawColor(226, 232, 240);
  pdf.line(20, 35, 190, 35);

  pdf.setFontSize(10);
  pdf.setTextColor(51, 65, 85);
  pdf.text('Front Side', 20, 44);
  const frontImgData = frontCanvas.toDataURL('image/png');
  pdf.addImage(frontImgData, 'PNG', 20, 48, 128, 80.8);

  pdf.text('Back Side', 20, 142);
  const backImgData = backCanvas.toDataURL('image/png');
  pdf.addImage(backImgData, 'PNG', 20, 146, 128, 80.8);

  pdf.setFontSize(9);
  pdf.setTextColor(100, 116, 139);
  pdf.text(
    `Issued by ${app.collegeName} via Student ID Card Portal · Academic Session ${app.academicYear}`,
    20,
    244
  );

  pdf.save(`Student-ID-${app.regNumber || app.referenceNumber}.pdf`);
}
