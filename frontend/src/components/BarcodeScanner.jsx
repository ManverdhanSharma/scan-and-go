import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const BarcodeScanner = ({ onScan }) => {
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    // Initialize the scanner UI
    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 150 } },
      false
    );

    scanner.render(
      (decodedText) => {
        if (scanning) {
          setScanning(false); // Pause so it doesn't scan 50 times a second
          scanner.clear();    // Turn off camera
          onScan(decodedText); // Send barcode back to the main app
        }
      },
      (error) => {
        // We ignore the constant errors when no barcode is in the frame
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, [scanning, onScan]);

  return (
    <div className="scanner-container">
      <div id="reader" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}></div>
      {!scanning && <p>Processing scan...</p>}
    </div>
  );
};

export default BarcodeScanner;