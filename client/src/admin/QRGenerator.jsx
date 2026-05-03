import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Printer } from 'lucide-react';

const QRGenerator = () => {
  const [table, setTable] = useState('1');
  const [size, setSize] = useState(200);

  const baseUrl = window.location.origin;
  const qrUrl = `${baseUrl}/menu?table=${table}`;

  const downloadQR = () => {
    const svg = document.getElementById('table-qr');
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw QR Code
      ctx.drawImage(img, 40, 40, 320, 320);
      
      // Add Table Text
      ctx.font = 'bold 28px sans-serif';
      ctx.fillStyle = '#FF4D4D';
      ctx.textAlign = 'center';
      ctx.fillText(`TABLE ${table}`, 200, 420);
      
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#666666';
      ctx.fillText('Scan to view menu', 200, 450);
      
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `ZaaykaQR_Table_${table}.png`;
      downloadLink.href = pngUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
      <h3 style={{ marginBottom: '1.5rem' }}>Table QR Generator</h3>
      
      <div style={{ marginBottom: '2rem' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Table Number</label>
        <input 
          type="number" 
          min="1"
          value={table}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || parseInt(val) >= 1) setTable(val);
          }}
          className="btn"
          style={{ width: '100px', border: '1px solid #ddd', background: 'white', textAlign: 'center', fontSize: '1.2rem' }}
        />
      </div>

      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '20px', 
        display: 'inline-block',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <QRCodeSVG 
          id="table-qr"
          value={qrUrl} 
          size={size}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "https://cdn-icons-png.flaticon.com/512/3075/3075977.png",
            x: undefined,
            y: undefined,
            height: 40,
            width: 40,
            excavate: true,
          }}
        />
        <p style={{ marginTop: '1rem', fontWeight: '700', fontSize: '1.2rem', color: 'var(--primary)' }}>TABLE {table}</p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scan to view menu</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button onClick={downloadQR} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Download size={18} /> Download
        </button>
        <button onClick={() => window.print()} className="btn" style={{ background: '#f0f0f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Printer size={18} /> Print
        </button>
      </div>
      
      <p style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        URL: <span style={{ color: 'var(--primary)' }}>{qrUrl}</span>
      </p>
    </div>
  );
};

export default QRGenerator;
