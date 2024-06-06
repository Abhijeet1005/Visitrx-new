import QRCode from 'qrcode';

export async function generateQRCode(data) {
    try {
      const jsonString = JSON.stringify(data);
      const qrCodeDataURL = await QRCode.toDataURL(jsonString);
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code', error);
      throw error;
    }
  }