import PDFDocument from 'pdfkit';

export interface ContractTerms {
  projectTitle: string;
  investorEmail: string;
  entrepreneurEmail: string;
  investmentAmount: number;
  contractType: 'mudarabah' | 'musharaka' | 'conventional_loan';
  profitShare?: number;
  duration?: number;
  expectedReturn?: number;
  startDate: string;
  endDate: string;
  conditions?: string[];
}

/**
 * Generate a contract PDF from terms
 * Returns a Buffer that can be uploaded to S3
 */
export const generateContractPDF = async (terms: ContractTerms): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', (err: Error) => reject(err));

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('PREDIKA INVESTMENT CONTRACT', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').text(`Contract Type: ${terms.contractType.toUpperCase()}`, {
      align: 'center',
    });
    doc.moveDown(1);

    // Contract Details
    doc.fontSize(12).font('Helvetica-Bold').text('CONTRACT DETAILS', { underline: true });
    doc.moveDown(0.3);

    doc.fontSize(10).font('Helvetica');
    doc.text(`Project: ${terms.projectTitle}`);
    doc.text(`Investment Amount: ${terms.investmentAmount.toLocaleString()} FCFA`);
    doc.text(`Contract Type: ${terms.contractType}`);
    doc.text(`Expected Return: ${terms.expectedReturn || 'TBD'}%`);
    doc.moveDown(0.5);

    // Parties
    doc.fontSize(12).font('Helvetica-Bold').text('PARTIES', { underline: true });
    doc.moveDown(0.3);

    doc.fontSize(10).font('Helvetica');
    doc.text(`Investor: ${terms.investorEmail}`);
    doc.text(`Entrepreneur: ${terms.entrepreneurEmail}`);
    doc.text(`Platform: Predika`);
    doc.moveDown(0.5);

    // Duration
    doc.fontSize(12).font('Helvetica-Bold').text('DURATION', { underline: true });
    doc.moveDown(0.3);

    doc.fontSize(10).font('Helvetica');
    doc.text(`Start Date: ${terms.startDate}`);
    doc.text(`End Date: ${terms.endDate}`);
    if (terms.duration) {
      doc.text(`Duration: ${terms.duration} months`);
    }
    doc.moveDown(0.5);

    // Terms & Conditions
    doc.fontSize(12).font('Helvetica-Bold').text('TERMS & CONDITIONS', { underline: true });
    doc.moveDown(0.3);

    doc.fontSize(10).font('Helvetica');

    if (terms.contractType === 'mudarabah') {
      doc.text(
        '1. Mudarabah Agreement: The investor provides capital and the entrepreneur manages the project.'
      );
      doc.text(`2. Profit Share: ${terms.profitShare || '50%'} of profits to investor, remainder to entrepreneur.`);
      doc.text('3. Loss: Investor bears the loss of capital in case of project failure.');
      doc.text('4. Management: Entrepreneur is responsible for managing the project.');
    } else if (terms.contractType === 'musharaka') {
      doc.text(
        '1. Musharaka Agreement: Both parties contribute capital and share profits based on agreement.'
      );
      doc.text(`2. Profit Share: ${terms.profitShare || '50%'} of profits to investor, remainder to entrepreneur.`);
      doc.text('3. Loss: Both parties share losses proportionally.');
      doc.text('4. Management: Both parties participate in project management.');
    } else {
      doc.text(`1. Conventional Loan: Investor provides ${terms.investmentAmount.toLocaleString()} FCFA as a loan.`);
      doc.text(`2. Interest Rate: ${terms.expectedReturn || 'TBD'}% per annum.`);
      doc.text('3. Repayment: Entrepreneur repays principal + interest as agreed.');
      doc.text('4. Default: Terms will be enforced according to applicable law.');
    }

    if (terms.conditions && terms.conditions.length > 0) {
      doc.moveDown(0.3);
      doc.fontSize(10).font('Helvetica-Bold').text('Additional Conditions:');
      terms.conditions.forEach((condition, index) => {
        doc.fontSize(9).font('Helvetica').text(`${index + 1}. ${condition}`);
      });
    }

    doc.moveDown(1);
    doc.fontSize(10).font('Helvetica').text('This contract is binding and enforceable under Predika platform terms.', {
      align: 'center',
      width: 450,
    });

    // Signatures Section
    doc.moveDown(1.5);
    doc.fontSize(11).font('Helvetica-Bold').text('SIGNATURES', { underline: true });
    doc.moveDown(1);

    doc.fontSize(9).font('Helvetica');
    doc.text('Investor Signature: ________________________    Date: ______________');
    doc.moveDown(0.5);
    doc.text(terms.investorEmail);

    doc.moveDown(1);
    doc.text('Entrepreneur Signature: ________________________    Date: ______________');
    doc.moveDown(0.5);
    doc.text(terms.entrepreneurEmail);

    doc.moveDown(1);
    doc.text('Admin/Platform Signature: ________________________    Date: ______________');
    doc.moveDown(0.5);
    doc.text('Predika Platform');

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').text(
      `Generated: ${new Date().toISOString()} | Contract ID: [Auto-filled on upload]`,
      {
        align: 'center',
      }
    );

    doc.end();
  });
};

export default {
  generateContractPDF,
};
